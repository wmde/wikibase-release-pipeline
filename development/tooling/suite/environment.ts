import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import type { RepositoryContext } from '../context.js';
import {
	ComposeProject
} from '../lib/docker-compose.js';
import type { CommandRunner } from '../lib/process.js';

const GENERATED_CONFIG_FILES = [
	'LocalSettings.php',
	'wikibase-php.ini',
	'wdqs-frontend-config.json'
];

export interface SuiteEnvironmentDependencies {
	buildImages: () => Promise<void>;
	commandRunner?: CommandRunner;
	fileSystem?: {
		exists: ( path: string ) => boolean;
		remove: ( path: string ) => void;
	};
}

export class SuiteEnvironment {
	public constructor(
		private readonly context: RepositoryContext,
		private readonly dependencies: SuiteEnvironmentDependencies
	) {}

	public async up( options: { build?: boolean; published?: boolean } = {} ): Promise<void> {
		const useLocalImages = options.published !== true;
		const project = this.composeProject( useLocalImages );
		await project.pull();
		if ( useLocalImages && options.build !== false ) {
			await this.dependencies.buildImages();
		}
		await project.up();
	}

	public async down(): Promise<void> {
		await this.composeProject( false ).down();
	}

	public async status(): Promise<void> {
		await this.composeProject( false ).status();
	}

	public async reset(): Promise<void> {
		await this.composeProject( false ).down( { volumes: true } );
		for ( const filename of GENERATED_CONFIG_FILES ) {
			const path = join( this.context.hostRepositoryRoot, 'config', filename );
			if ( this.fileSystem.exists( path ) ) {
				console.log( `Removing ${ path }` );
				this.fileSystem.remove( path );
			}
		}
	}

	private composeProject( localImages: boolean ): ComposeProject {
		const root = this.context.hostRepositoryRoot;
		const envFile = join( root, '.env' );
		if ( !this.fileSystem.exists( envFile ) ) {
			throw new Error(
				`Suite configuration not found at ${ envFile }. Run the installer or create it from .env.example first.`
			);
		}

		const composeFiles = [ join( root, 'docker-compose.yml' ) ];
		if ( localImages ) {
			composeFiles.push(
				join( root, 'development', 'docker-compose.local-images.yml' )
			);
		}
		const customComposeFile = join( root, 'docker-compose.local.yml' );
		if ( this.fileSystem.exists( customComposeFile ) ) {
			composeFiles.push( customComposeFile );
		}

		return new ComposeProject(
			{
				projectDirectory: root,
				envFiles: [ envFile ],
				composeFiles
			},
			this.dependencies.commandRunner
		);
	}

	private get fileSystem(): NonNullable<
	SuiteEnvironmentDependencies[ 'fileSystem' ]
	> {
		return this.dependencies.fileSystem ?? {
			exists: existsSync,
			remove: ( path: string ) => rmSync( path )
		};
	}
}
