import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

export interface ReleaseProject {
	name: string;
	packagePath: string;
	changelogPath: string;
	pathspecs: string[];
	legacyTagNames: string[];
	isImage: boolean;
}

export const DEVELOPMENT_ROOT = process.cwd();
export const REPOSITORY_ROOT = resolve( DEVELOPMENT_ROOT, '..' );
export const IMAGES_ROOT = join( DEVELOPMENT_ROOT, 'images' );

export function readImageNames(): string[] {
	return readdirSync( IMAGES_ROOT )
		.filter( ( entry ) => {
			const projectRoot = join( IMAGES_ROOT, entry );
			return (
				statSync( projectRoot ).isDirectory() &&
				existsSync( join( projectRoot, 'Dockerfile' ) ) &&
				existsSync( join( projectRoot, 'package.json' ) )
			);
		} )
		.map( ( entry ) => {
			const packageJson = JSON.parse(
				readFileSync( join( IMAGES_ROOT, entry, 'package.json' ), 'utf8' )
			) as { name?: string };
			if ( !packageJson.name ) {
				throw new Error( `Image project ${ entry } has no package name.` );
			}
			if ( packageJson.name !== entry ) {
				throw new Error(
					`Image directory ${ entry } does not match package name ${ packageJson.name }.`
				);
			}
			return entry;
		} )
		.sort();
}

export function readReleaseProjects(): ReleaseProject[] {
	return [
		{
			name: 'wbs',
			packagePath: join( REPOSITORY_ROOT, 'package.json' ),
			changelogPath: join( REPOSITORY_ROOT, 'CHANGELOG.md' ),
			pathspecs: [
				'.env.example',
				'README.md',
				'package.json',
				'CHANGELOG.md',
				'docker-compose.yml',
				'docker-compose.local.yml',
				'install',
				'wbs',
				'config',
				'docs',
				'tools'
			],
			legacyTagNames: [ 'deploy' ],
			isImage: false
		},
		...readImageNames().map(
			( name ): ReleaseProject => ( {
				name,
				packagePath: join( IMAGES_ROOT, name, 'package.json' ),
				changelogPath: join( IMAGES_ROOT, name, 'CHANGELOG.md' ),
				pathspecs: [ `development/images/${ name }` ],
				legacyTagNames: [],
				isImage: true
			} )
		)
	];
}

export function resolveProjectSelections(
	requested: string[],
	projects: ReleaseProject[],
	command: string,
	options: { requireExplicit?: boolean; imagesOnly?: boolean } = {}
): ReleaseProject[] {
	const available = projects.filter(
		( project ) => !options.imagesOnly || project.isImage
	);
	if ( requested.length === 0 ) {
		if ( options.requireExplicit ) {
			throw new Error( `${ command } requires a project name or "all".` );
		}
		return available;
	}
	if ( requested.includes( 'all' ) ) {
		if ( requested.length !== 1 ) {
			throw new Error(
				`${ command }: "all" cannot be combined with project names.`
			);
		}
		return available;
	}
	const names = available.map( ( project ) => project.name );
	const unknown = requested.filter( ( name ) => !names.includes( name ) );
	if ( unknown.length > 0 ) {
		throw new Error(
			`${ command }: unknown project${ unknown.length === 1 ? '' : 's' } ${ unknown.join( ', ' ) }. ` +
				`Available projects: ${ names.join( ', ' ) }.`
		);
	}
	return [ ...new Set( requested ) ].map(
		( name ) => available.find( ( project ) => project.name === name )!
	);
}
