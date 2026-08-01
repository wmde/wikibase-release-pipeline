import { Command } from 'commander';
import { spawn } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

type CommandName = 'build' | 'lint' | 'publish' | 'test' | 'update-commits';

interface ParsedArguments {
	selections: string[];
	forwarded: string[];
	parallel: number;
}

interface Task {
	label: string;
	command: string;
	args: string[];
}

const DEVELOPMENT_ROOT = process.cwd();
const IMAGES_ROOT = join( DEVELOPMENT_ROOT, 'images' );
const DEFAULT_BUILD_PARALLELISM = 3;
const UPDATE_COMMIT_IMAGES = [ 'quickstatements', 'wdqs-frontend', 'wikibase' ];

function fail( message: string ): never {
	throw new Error( message );
}

function readImageNames(): string[] {
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
				fail( `Image project ${ entry } has no package name.` );
			}
			if ( packageJson.name !== entry ) {
				fail(
					`Image directory ${ entry } does not match package name ${ packageJson.name }.`
				);
			}
			return entry;
		} )
		.sort();
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
			if ( parsed.forwarded.includes( '--publish' ) ) {
				fail(
					'build does not accept --publish; use the explicit publish command.'
				);
			}
			const selected = resolveSelections( parsed.selections, images, command );
			return {
				parallel: parsed.parallel,
				tasks: selected.map( ( image ) => ( {
					label: `build ${ image }`,
					command: 'scripts/build-image.sh',
					args: [ image, ...parsed.forwarded ]
				} ) )
			};
		}

		case 'publish': {
			const parsed = parseArguments( args, false );
			const selected = resolveSelections( parsed.selections, images, command, {
				requireExplicit: true
			} );
			return {
				parallel: 1,
				tasks: selected.map( ( image ) => ( {
					label: `publish ${ image }`,
					command: 'scripts/build-image.sh',
					args: [ image, '--publish', ...parsed.forwarded ]
				} ) )
			};
		}

		case 'update-commits': {
			const parsed = parseArguments( args, false );
			if ( parsed.forwarded.length > 0 ) {
				fail(
					`update-commits does not accept options: ${ parsed.forwarded.join( ' ' ) }.`
				);
			}
			const selected = resolveSelections(
				parsed.selections,
				UPDATE_COMMIT_IMAGES,
				command
			);
			return {
				parallel: 1,
				tasks: selected.map( ( image ) => ( {
					label: `update-commits ${ image }`,
					command: 'scripts/update-commits/run.sh',
					args: [ image ]
				} ) )
			};
		}

		case 'test': {
			return {
				parallel: 1,
				tasks: [
					{
						label:
							args.length > 0 ?
								`test ${ args.join( ' ' ) }` :
								'test all suites',
						command: 'scripts/test/run.sh',
						args
					}
				]
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

async function runTask( task: Task ): Promise<number> {
	console.log( `\n=== ${ task.label } ===` );
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
	await runTasks( tasks, parallel );
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
		'update-commits',
		'Update all or selected supported upstream commit pins.',
		'[IMAGE...]'
	);
	addProxyCommand(
		program,
		'publish',
		'Publish official version tags for explicitly selected images.',
		'IMAGE... [docker buildx options...]'
	);

	program.addHelpText(
		'after',
		[
			'',
			'Selection defaults:',
			'  build selects all images, test selects all integration suites, lint selects the',
			'  repository root, and update-commits selects every supported image when no',
			'  target is given. "all" is an explicit equivalent where supported. publish',
			'  always requires explicit image names.',
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
			'  wbs-dev test repo --spec specs/repo/special-new-item.ts',
			'  wbs-dev update-commits wikibase quickstatements',
			'  wbs-dev publish wikibase --dry-run'
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
