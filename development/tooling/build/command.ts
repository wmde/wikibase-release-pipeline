import type { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { RepositoryContext } from '../context.js';
import { discoverImageNames } from '../projects.js';
import { resolveNames } from '../selection.js';
import { runTasks } from '../tasks.js';
import { assertStableVersion } from '../versions.js';

interface ParsedBuildArguments {
	images: string[];
	forwarded: string[];
	parallel: number;
}

const DEFAULT_PARALLELISM = 3;

function positiveInteger( value: string ): number {
	const parsed = Number.parseInt( value, 10 );
	if ( !/^\d+$/u.test( value ) || parsed < 1 ) {
		throw new Error(
			`--parallel requires a positive integer, received "${ value }".`
		);
	}
	return parsed;
}

export function parseBuildArguments( args: string[] ): ParsedBuildArguments {
	const images: string[] = [];
	const forwarded: string[] = [];
	let parallel = DEFAULT_PARALLELISM;
	let forwarding = false;
	let explicitForwarding = false;

	for ( let index = 0; index < args.length; index++ ) {
		const argument = args[ index ];
		if ( !explicitForwarding && argument === '--parallel' ) {
			const value = args[ ++index ];
			if ( value === undefined ) {
				throw new Error( '--parallel requires a positive integer.' );
			}
			parallel = positiveInteger( value );
			continue;
		}
		if ( !explicitForwarding && argument.startsWith( '--parallel=' ) ) {
			parallel = positiveInteger( argument.slice( '--parallel='.length ) );
			continue;
		}
		if ( argument === '--' ) {
			forwarding = true;
			explicitForwarding = true;
			continue;
		}
		if ( !forwarding && argument.startsWith( '-' ) ) {
			forwarding = true;
		}
		if ( forwarding ) {
			forwarded.push( argument );
		} else {
			images.push( argument );
		}
	}

	return { images, forwarded, parallel };
}

async function runBuild(
	args: string[],
	context: RepositoryContext
): Promise<void> {
	const parsed = parseBuildArguments( args );
	const selected = resolveNames( parsed.images, discoverImageNames( context ), {
		command: 'build',
		noun: 'image'
	} );
	if ( parsed.forwarded.includes( '--publish' ) ) {
		if ( parsed.images.length !== 1 || selected.length !== 1 ) {
			throw new Error(
				'build --publish requires exactly one explicit image project.'
			);
		}
		const packageJson = JSON.parse(
			readFileSync(
				join( context.imagesRoot, selected[ 0 ], 'package.json' ),
				'utf8'
			)
		) as { version: string };
		assertStableVersion( packageJson.version, `${ selected[ 0 ] } package` );
	}

	await runTasks(
		selected.map( ( image ) => ( {
			label: `build ${ image }`,
			command: 'tooling/build/image.sh',
			args: [ image, ...parsed.forwarded ]
		} ) ),
		{ cwd: context.developmentRoot, parallel: parsed.parallel }
	);
}

export function registerBuildCommand(
	program: Command,
	context: RepositoryContext
): void {
	const images = discoverImageNames( context );
	program
		.command( 'build' )
		.description( 'Build all or selected images.' )
		.argument( '[arguments...]', '[IMAGE...] [docker buildx options...]' )
		.allowUnknownOption()
		.allowExcessArguments()
		.passThroughOptions()
		.addHelpText(
			'after',
			[
				'',
				'Targets:',
				`  ${ images.join( ', ' ) }`,
				'  With no target or "all", build every image.',
				'',
				'wbs-dev build option:',
				`  --parallel=N  maximum concurrent image builds (default: ${ DEFAULT_PARALLELISM })`,
				'  Other options after the image list are forwarded to Docker Buildx.',
				'',
				'Examples:',
				'  wbs-dev build',
				'  wbs-dev build wikibase wdqs --no-cache --pull',
				'  wbs-dev build wikibase wdqs --parallel=2 --dry-run',
				'  wbs-dev build wikibase --publish --dry-run'
			].join( '\n' )
		)
		.action( async ( args: string[] ) => await runBuild( args, context ) );
}
