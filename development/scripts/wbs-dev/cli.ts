import { Command } from 'commander';
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';
import { fetchRemoteTags } from './git.js';
import {
	DEVELOPMENT_ROOT,
	IMAGES_ROOT,
	readImageNames,
	readReleaseProjects,
	resolveProjectSelections
} from './projects.js';
import {
	preflightRelease,
	publishGitTags,
	requireDockerHubImages
} from './release.js';
import {
	applyFileUpdates,
	assertStableVersion,
	planVersionUpdate,
	type FileUpdate
} from './versioning.js';

type CommandName = 'build' | 'lint' | 'test' | 'update-sources';

interface ParsedArguments {
	selections: string[];
	forwarded: string[];
	parallel: number;
}

interface Task {
	label: string;
	command: string;
	args: string[];
	announce?: boolean;
}

const DEFAULT_BUILD_PARALLELISM = 3;
const UPDATE_SOURCE_IMAGES = [ 'quickstatements', 'wdqs-frontend', 'wikibase' ];

function fail( message: string ): never {
	throw new Error( message );
}

function parseArguments(
	args: string[],
	allowParallel: boolean
): ParsedArguments {
	const selections: string[] = [];
	const forwarded: string[] = [];
	let parallel = DEFAULT_BUILD_PARALLELISM;
	let forwarding = false;

	for ( let index = 0; index < args.length; index++ ) {
		const argument = args[ index ];

		if ( allowParallel && argument === '--parallel' ) {
			const value = args[ ++index ];
			if ( value === undefined ) {
				fail( '--parallel requires a positive integer.' );
			}
			parallel = parsePositiveInteger( value, '--parallel' );
			continue;
		}

		if ( allowParallel && argument.startsWith( '--parallel=' ) ) {
			parallel = parsePositiveInteger(
				argument.slice( '--parallel='.length ),
				'--parallel'
			);
			continue;
		}

		if ( argument === '--' ) {
			forwarding = true;
			continue;
		}

		if ( !forwarding && argument.startsWith( '-' ) ) {
			forwarding = true;
		}

		if ( forwarding ) {
			forwarded.push( argument );
		} else {
			selections.push( argument );
		}
	}

	return { selections, forwarded, parallel };
}

function parsePositiveInteger( value: string, option: string ): number {
	const parsed = Number.parseInt( value, 10 );
	if ( !/^\d+$/.test( value ) || parsed < 1 ) {
		fail( `${ option } requires a positive integer, received "${ value }".` );
	}
	return parsed;
}

function resolveSelections(
	requested: string[],
	available: string[],
	command: string,
	options: { requireExplicit?: boolean } = {}
): string[] {
	if ( requested.length === 0 ) {
		if ( options.requireExplicit ) {
			fail( `${ command } requires at least one explicit target.` );
		}
		return available;
	}

	if ( requested.includes( 'all' ) ) {
		if ( options.requireExplicit ) {
			fail( `${ command }: select each target explicitly instead of using "all".` );
		}
		if ( requested.length !== 1 ) {
			fail( `${ command }: "all" cannot be combined with specific targets.` );
		}
		return available;
	}

	const unknown = requested.filter( ( target ) => !available.includes( target ) );
	if ( unknown.length > 0 ) {
		fail(
			`${ command }: unknown target${ unknown.length === 1 ? '' : 's' } ${ unknown.join( ', ' ) }. ` +
				`Available targets: ${ available.join( ', ' ) }.`
		);
	}

	return [ ...new Set( requested ) ];
}

function commandTasks(
	command: CommandName,
	args: string[]
): { tasks: Task[]; parallel: number } {
	const images = readImageNames();

	switch ( command ) {
		case 'build': {
			const parsed = parseArguments( args, true );
			const selected = resolveSelections( parsed.selections, images, command );
			if ( parsed.forwarded.includes( '--publish' ) ) {
				if ( parsed.selections.length !== 1 || selected.length !== 1 ) {
					fail( 'build --publish requires exactly one explicit image project.' );
				}
				const packageJson = JSON.parse(
					readFileSync( join( IMAGES_ROOT, selected[ 0 ], 'package.json' ), 'utf8' )
				) as { version: string };
				assertStableVersion( packageJson.version, `${ selected[ 0 ] } package` );
			}
			return {
				parallel: parsed.parallel,
				tasks: selected.map( ( image ) => ( {
					label: `build ${ image }`,
					command: 'scripts/build-image.sh',
					args: [ image, ...parsed.forwarded ]
				} ) )
			};
		}

		case 'update-sources': {
			const parsed = parseArguments( args, false );
			if ( parsed.selections.length === 0 ) {
				fail( 'update-sources requires an image project or "all".' );
			}
			if ( parsed.forwarded.length > 0 ) {
				fail(
					`update-sources does not accept options: ${ parsed.forwarded.join( ' ' ) }.`
				);
			}
			const selected = resolveSelections(
				parsed.selections,
				UPDATE_SOURCE_IMAGES,
				command
			);
			return {
				parallel: 1,
				tasks: selected.map( ( image ) => ( {
					label: `update-sources ${ image }`,
					command: 'scripts/update-sources/run.sh',
					args: [ image ]
				} ) )
			};
		}

		case 'test': {
			const parsed = parseArguments( args, false );
			const includeTooling =
				!args.includes( '--help' ) &&
				( parsed.selections.length === 0 ||
					parsed.selections.includes( 'all' ) ||
					parsed.selections.includes( 'tooling' ) );
			const integrationSelections = parsed.selections.filter(
				( selection ) => selection !== 'tooling'
			);
			if (
				parsed.selections.includes( 'tooling' ) &&
				integrationSelections.length === 0 &&
				parsed.forwarded.length > 0
			) {
				fail( 'The tooling test target does not accept integration test options.' );
			}
			const integrationArgs = [
				...integrationSelections,
				...parsed.forwarded
			];
			const includeIntegration =
				integrationSelections.length > 0 ||
				!parsed.selections.includes( 'tooling' );
			const tasks: Task[] = [];
			if ( includeTooling ) {
				tasks.push( {
					label: 'test wbs-dev tooling',
					command: 'pnpm',
					args: [ 'test:scripts' ]
				} );
			}
			if ( includeIntegration ) {
				tasks.push( {
					announce: false,
					label:
						integrationArgs.length > 0 ?
							`test ${ integrationArgs.join( ' ' ) }` :
							'test all integration suites',
					command: 'scripts/test/run.sh',
					args: integrationArgs
				} );
			}
			return {
				parallel: 1,
				tasks
			};
		}

		case 'lint': {
			const parsed = parseArguments( args, false );
			const lintPaths = new Map<string, string>( [
				[ 'root', '..' ],
				[ 'development', '.' ],
				[ 'test', 'test' ],
				...images.map( ( image ) => [ image, `images/${ image }` ] as [string, string] )
			] );
			const requested =
				parsed.selections.length === 0 ||
				( parsed.selections.length === 1 && parsed.selections[ 0 ] === 'all' ) ?
					[ 'root' ] :
					parsed.selections;
			const selected = resolveSelections(
				requested,
				[ ...lintPaths.keys() ],
				command
			);
			return {
				parallel: 1,
				tasks: selected.map( ( target ) => ( {
					label: `lint ${ target }`,
					command: 'scripts/lint.sh',
					args: [ lintPaths.get( target )!, ...parsed.forwarded ]
				} ) )
			};
		}
	}
}

async function updateVersions( requested: string[] ): Promise<void> {
	const projects = resolveProjectSelections(
		requested,
		readReleaseProjects(),
		'update-versions',
		{ requireExplicit: true }
	);
	fetchRemoteTags();
	const plans = projects
		.map( ( project ) => planVersionUpdate( project ) )
		.filter( Boolean );
	if ( plans.length === 0 ) {
		console.log( 'No selected projects have releasable changes.' );
		return;
	}
	for ( const plan of plans ) {
		console.log(
			`Preparing ${ plan!.project.name } ${ plan!.targetVersion } (${ plan!.reason }).`
		);
	}
	const updates = plans.reduce<FileUpdate[]>(
		( accumulated, plan ) => [ ...accumulated, ...plan!.updates ],
		[]
	);
	applyFileUpdates( updates );
	console.log(
		'Updated local files. Nothing was staged, committed, tagged, or pushed. Review with git diff.'
	);
}

async function releaseImages(
	requested: string[],
	dryRun: boolean
): Promise<void> {
	const projects = resolveProjectSelections(
		requested,
		readReleaseProjects(),
		'release images',
		{ imagesOnly: true }
	);
	publishGitTags( preflightRelease( projects ), dryRun );
}

async function releaseWbs( dryRun: boolean ): Promise<void> {
	const projects = readReleaseProjects();
	const wbs = projects.find( ( project ) => project.name === 'wbs' )!;
	const images = projects.filter( ( project ) => project.isImage );
	const targets = preflightRelease( [ wbs ] );
	await requireDockerHubImages( images, { wait: false } );
	publishGitTags( targets, dryRun );
}

async function releaseAll( dryRun: boolean ): Promise<void> {
	const projects = readReleaseProjects();
	const images = projects.filter( ( project ) => project.isImage );
	const wbs = projects.find( ( project ) => project.name === 'wbs' )!;
	const targets = preflightRelease( [ ...images, wbs ] );
	const imageTargets = targets.filter( ( target ) => target.project.isImage );
	const wbsTargets = targets.filter( ( target ) => !target.project.isImage );
	publishGitTags( imageTargets, dryRun );
	if ( dryRun ) {
		publishGitTags( wbsTargets, true );
		console.log(
			'Dry run: WBS publication would wait for every full-version image tag.'
		);
		return;
	}
	await requireDockerHubImages( images, { wait: true } );
	publishGitTags( wbsTargets, false );
}

async function runTask( task: Task ): Promise<number> {
	if ( task.announce !== false ) {
		console.log( `\n=== ${ task.label } ===` );
	}
	return await new Promise( ( resolve, reject ) => {
		const child = spawn( task.command, task.args, {
			cwd: DEVELOPMENT_ROOT,
			env: process.env,
			stdio: 'inherit'
		} );
		child.once( 'error', reject );
		child.once( 'exit', ( code, signal ) => {
			if ( signal ) {
				console.error( `${ task.label } terminated by signal ${ signal }.` );
				resolve( 1 );
				return;
			}
			resolve( code ?? 1 );
		} );
	} );
}

async function runTasks( tasks: Task[], parallel: number ): Promise<void> {
	let nextTask = 0;
	let failed = false;

	const worker = async (): Promise<void> => {
		while ( !failed ) {
			const taskIndex = nextTask++;
			if ( taskIndex >= tasks.length ) {
				return;
			}
			const exitCode = await runTask( tasks[ taskIndex ] );
			if ( exitCode !== 0 ) {
				failed = true;
				process.exitCode = exitCode;
			}
		}
	};

	await Promise.all(
		Array.from(
			{ length: Math.min( parallel, tasks.length ) },
			async () => await worker()
		)
	);

	if ( failed ) {
		fail( 'One or more tasks failed.' );
	}
}

async function executeCommand(
	command: CommandName,
	args: string[]
): Promise<void> {
	const { tasks, parallel } = commandTasks( command, args );
	const sourceBackups =
		command === 'update-sources' ?
			tasks.map( ( task ) => {
				const path = join( IMAGES_ROOT, task.args[ 0 ], 'build.env' );
				return { path, contents: readFileSync( path, 'utf8' ) };
			} ) :
			[];
	try {
		await runTasks( tasks, parallel );
	} catch ( error ) {
		if ( sourceBackups.length > 0 ) {
			applyFileUpdates( sourceBackups );
			console.error(
				'Restored every selected source file after the update failed.'
			);
		}
		throw error;
	}
}

function addProxyCommand(
	program: Command,
	name: CommandName,
	description: string,
	argumentDescription: string,
	options: { forwardHelp?: boolean } = {}
): void {
	const command = program
		.command( name )
		.description( description )
		.argument( '[arguments...]', argumentDescription )
		.allowUnknownOption()
		.allowExcessArguments()
		.passThroughOptions();

	if ( options.forwardHelp ) {
		command.helpOption( false );
	}

	command.action( async ( args: string[] ) => await executeCommand( name, args ) );
}

async function main(): Promise<void> {
	const program = new Command();
	program
		.name( 'wbs-dev' )
		.description(
			'Build, test, lint, update, and publish Wikibase Suite projects.'
		)
		.showHelpAfterError()
		.showSuggestionAfterError()
		.enablePositionalOptions();

	addProxyCommand(
		program,
		'build',
		'Build all or selected images.',
		'[IMAGE...] [docker buildx options...]'
	);
	const buildCommand = program.commands.find(
		( command ) => command.name() === 'build'
	);
	if ( buildCommand ) {
		buildCommand.addHelpText(
			'after',
			'\nCoordinator option:\n  --parallel=N  maximum concurrent image builds (default: 3)'
		);
	}
	addProxyCommand(
		program,
		'test',
		'Run all or selected integration test suites.',
		'[SUITE...] [test options...]',
		{ forwardHelp: true }
	);
	addProxyCommand(
		program,
		'lint',
		'Lint the repository or selected paths.',
		'[root|development|test|IMAGE...] [lint options...]'
	);
	addProxyCommand(
		program,
		'update-sources',
		'Update upstream commit pins in local, unstaged files.',
		'IMAGE...|all'
	);
	program
		.command( 'update-versions' )
		.description(
			'Infer versions and update local package files and changelogs atomically.'
		)
		.argument( '<projects...>', 'PROJECT...|all' )
		.action( async ( projects: string[] ) => await updateVersions( projects ) );

	const release = program
		.command( 'release' )
		.description( 'Create and push reviewed release tags.' )
		.action( () => release.help() );
	release
		.command( 'images' )
		.description(
			'Release selected images, or every image when none is selected.'
		)
		.argument( '[images...]' )
		.option( '--dry-run', 'Validate and show tags without creating them.' )
		.action(
			async ( images: string[] | undefined, options: { dryRun?: boolean } ) =>
				await releaseImages( images ?? [], options.dryRun ?? false )
		);
	release
		.command( 'wbs' )
		.description( 'Release WBS after confirming every required image exists.' )
		.option( '--dry-run', 'Validate and show the tag without creating it.' )
		.action(
			async ( options: { dryRun?: boolean } ) =>
				await releaseWbs( options.dryRun ?? false )
		);
	release
		.command( 'all' )
		.description( 'Release images, wait for publication, and then release WBS.' )
		.option(
			'--dry-run',
			'Validate and show the complete sequence without creating tags.'
		)
		.action(
			async ( options: { dryRun?: boolean } ) =>
				await releaseAll( options.dryRun ?? false )
		);

	program.addHelpText(
		'after',
		[
			'',
			'Selection defaults:',
			'  build selects all images, test selects all integration suites, lint selects the',
			'  repository root. Release preparation commands require explicit projects;',
			'  use "all" as their sole target to select every supported project.',
			'  Preparation changes remain local and unstaged; review them with git diff.',
			'  Preparation commands do not support --dry-run; build options are forwarded.',
			'',
			'Argument forwarding:',
			'  Options after the target list are passed unchanged to the underlying build,',
			'  test, or lint command. No "--" separator is required.',
			'',
			'Examples:',
			'  wbs-dev build',
			'  wbs-dev build wikibase wdqs --no-cache --pull',
			'  wbs-dev build wikibase wdqs --parallel=2 --dry-run',
			'  wbs-dev test repo queryservice --headed',
			'  wbs-dev test repo --spec suites/repo/specs/special-new-item.ts',
			'  wbs-dev update-sources wikibase quickstatements',
			'  wbs-dev update-versions wikibase wbs',
			'  wbs-dev build wikibase --publish --dry-run',
			'  wbs-dev release all --dry-run'
		].join( '\n' )
	);

	if ( process.argv.length === 2 ) {
		program.help();
	}

	await program.parseAsync( process.argv );
}

main().catch( ( error ) => {
	console.error( error instanceof Error ? `wbs-dev: ${ error.message }` : error );
	process.exitCode = process.exitCode || 1;
} );
