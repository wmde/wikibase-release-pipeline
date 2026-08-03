import { Launcher, type RunCommandArguments } from '@wdio/cli';
import logger from '@wdio/logger';
import chalk from 'chalk';
import { Command, InvalidArgumentError, Option } from 'commander';
import { spawn } from 'node:child_process';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import process from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';

type WdioOptions = Partial<RunCommandArguments> & {
	repeat?: number;
	coverage?: boolean;
};

interface TestOptions extends WdioOptions {
	debug?: boolean;
	headed?: boolean;
	nodeDebug?: boolean;
	setup?: boolean;
	skipBuild?: boolean;
}

const DEVELOPMENT_ROOT = join( dirname( fileURLToPath( import.meta.url ) ), '../..' );
const TEST_ROOT = join( DEVELOPMENT_ROOT, 'test' );
const SUITES_ROOT = join( TEST_ROOT, 'suites' );

process.chdir( TEST_ROOT );

const getSuiteConfigFilePath = ( suiteName: string ): string =>
	join( SUITES_ROOT, suiteName, `${ suiteName }.conf.ts` );

export const allSuiteNames = readdirSync( SUITES_ROOT )
	.filter( ( entry ) => {
		const suiteRoot = join( SUITES_ROOT, entry );
		return (
			statSync( suiteRoot ).isDirectory() &&
			existsSync( getSuiteConfigFilePath( entry ) )
		);
	} )
	.sort();

function parseNumber( value: string ): number {
	const parsed = Number( value );
	if ( !Number.isFinite( parsed ) ) {
		throw new InvalidArgumentError( `Expected a number, received "${ value }".` );
	}
	return parsed;
}

function parseShard( value: string ): { current: number; total: number } {
	const match = /^(\d+)\/(\d+)$/.exec( value );
	if ( !match || Number( match[ 1 ] ) < 1 || Number( match[ 2 ] ) < 1 ) {
		throw new InvalidArgumentError( 'Expected a shard in the form x/y.' );
	}
	return { current: Number( match[ 1 ] ), total: Number( match[ 2 ] ) };
}

function parseJson( value: string ): Record<string, unknown> {
	try {
		return JSON.parse( value ) as Record<string, unknown>;
	} catch ( _error ) {
		throw new InvalidArgumentError( 'Expected a JSON object.' );
	}
}

function collect( value: string, previous: string[] ): string[] {
	return [ ...previous, value ];
}

function addWdioOptions( command: Command ): void {
	command
		.option(
			'--watch',
			'Automatically rerun tests when suite files change (WDIO)'
		)
		.option(
			'-H, --hostname <hostname>',
			'Automation driver host address (WDIO)'
		)
		.option( '-p, --port <port>', 'Automation driver port (WDIO)', parseNumber )
		.option( '--path <path>', 'Path to WebDriver endpoints (WDIO)' )
		.option( '-u, --user <user>', 'Cloud service username (WDIO)' )
		.option( '-k, --key <key>', 'Cloud service access key (WDIO)' )
		.addOption(
			new Option( '-l, --log-level <level>', 'Logging verbosity (WDIO)' ).choices(
				[ 'trace', 'debug', 'info', 'warn', 'error', 'silent' ]
			)
		)
		.option(
			'--bail <count>',
			'Stop after this many test failures (WDIO)',
			parseNumber
		)
		.option( '--base-url <url>', 'Override the configured base URL (WDIO)' )
		.option(
			'-w, --waitfor-timeout <milliseconds>',
			'waitFor timeout (WDIO)',
			parseNumber
		)
		.option( '-s, --update-snapshots <mode>', 'Snapshot update mode (WDIO)' )
		.option( '-f, --framework <name>', 'Test framework override (WDIO)' )
		.option(
			'-r, --reporter <name>',
			'Reporter; repeat for multiple (WDIO)',
			collect,
			[]
		)
		.option(
			'--suite <name>',
			'Configured WDIO suite; repeat for multiple',
			collect,
			[]
		)
		.option(
			'--spec <path>',
			'Spec file or glob; repeat for multiple (WDIO)',
			collect,
			[]
		)
		.option(
			'--exclude <path>',
			'Excluded spec or glob; repeat for multiple (WDIO)',
			collect,
			[]
		)
		.option( '--repeat <count>', 'Repeat specs or suites (WDIO)', parseNumber )
		.option( '--mocha-opts <json>', 'Mocha options as JSON (WDIO)', parseJson )
		.option(
			'--jasmine-opts <json>',
			'Jasmine options as JSON (WDIO)',
			parseJson
		)
		.option(
			'--cucumber-opts <json>',
			'Cucumber options as JSON (WDIO)',
			parseJson
		)
		.option( '--coverage', 'Enable browser-runner coverage (WDIO)' )
		.option( '--headless', 'Override capabilities to run headlessly (WDIO)' )
		.option(
			'--shard <x/y>',
			'Run one shard of the selected tests (WDIO)',
			parseShard
		)
		.option( '--ts-config-path <path>', 'TypeScript configuration path (WDIO)' );
}

function prepareWdioOptions( options: TestOptions ): WdioOptions {
	const { debug, headed, nodeDebug } = options;
	const wdioOptions = { ...options } as TestOptions & { reporter?: string[] };
	const reporter = wdioOptions.reporter;
	delete wdioOptions.debug;
	delete wdioOptions.headed;
	delete wdioOptions.nodeDebug;
	delete wdioOptions.reporter;
	delete wdioOptions.setup;
	delete wdioOptions.skipBuild;

	if ( headed ) {
		process.env.HEADED_TESTS = 'true';
	}
	if ( debug || nodeDebug ) {
		process.env.DEBUG = nodeDebug ? 'node' : 'true';
	}

	if ( reporter && reporter.length ) {
		wdioOptions.reporters = reporter;
	}

	for ( const key of Object.keys( wdioOptions ) as ( keyof typeof wdioOptions )[] ) {
		const value = wdioOptions[ key ];
		if ( Array.isArray( value ) && value.length === 0 ) {
			delete wdioOptions[ key ];
		}
	}

	return wdioOptions;
}

async function buildImages(): Promise<void> {
	await new Promise<void>( ( resolveBuild, rejectBuild ) => {
		const child = spawn(
			'pnpm',
			[ 'exec', 'tsx', 'scripts/wbs-dev/cli.ts', 'build', '--quiet' ],
			{
				cwd: DEVELOPMENT_ROOT,
				env: process.env,
				stdio: [ 'inherit', 'ignore', 'inherit' ]
			}
		);
		child.once( 'error', rejectBuild );
		child.once( 'exit', ( code, signal ) => {
			if ( signal ) {
				rejectBuild( new Error( `Image builds terminated by signal ${ signal }.` ) );
				return;
			}
			if ( code !== 0 ) {
				rejectBuild( new Error( 'One or more image builds failed.' ) );
				return;
			}
			resolveBuild();
		} );
	} );
}

function printSuiteHeading( suiteName: string ): void {
	console.log(
		chalk.bgWhiteBright.black.bold(
			`\n"${ suiteName }" test suite ${ ' '.repeat( Math.max( 1, 96 - suiteName.length ) ) }`
		)
	);
}

async function runSuites(
	requestedSuites: string[],
	options: TestOptions
): Promise<void> {
	const suiteNames =
		requestedSuites.length === 0 || requestedSuites.includes( 'all' ) ?
			allSuiteNames :
			requestedSuites;

	if ( requestedSuites.includes( 'all' ) && requestedSuites.length > 1 ) {
		throw new Error( '"all" cannot be combined with named suites.' );
	}

	const unknown = suiteNames.filter(
		( suiteName ) => !allSuiteNames.includes( suiteName )
	);
	if ( unknown.length ) {
		throw new Error(
			`Unknown test suite${ unknown.length === 1 ? '' : 's' }: ${ unknown.join( ', ' ) }. ` +
				`Available suites: ${ allSuiteNames.join( ', ' ) }.`
		);
	}

	if ( options.setup && suiteNames.length !== 1 ) {
		throw new Error( '--setup requires exactly one named suite.' );
	}
	if ( options.setup && ( ( options.spec && options.spec.length ) || options.watch ) ) {
		throw new Error( '--setup cannot be combined with --spec or --watch.' );
	}
	if ( options.setup ) {
		printSuiteHeading( suiteNames[ 0 ] );
		if ( !options.skipBuild ) {
			await buildImages();
			console.log( '✅ All image builds are current.' );
		}
		const configUrl = pathToFileURL( getSuiteConfigFilePath( suiteNames[ 0 ] ) ).href;
		// eslint-disable-next-line es-x/no-dynamic-import
		const { testEnv } = ( await import( configUrl ) ) as {
			testEnv: {
				up: () => Promise<void>;
				releaseExitListener: () => void;
			};
		};
		try {
			await testEnv.up();
		} finally {
			testEnv.releaseExitListener();
		}
		return;
	}

	if ( suiteNames.length > 1 ) {
		console.log(
			chalk.whiteBright.bold( `\n🎡 Running ${ suiteNames.length } test suites:` ),
			chalk.whiteBright( suiteNames.join( ', ' ) )
		);
	}

	const wdioOptions = prepareWdioOptions( options );
	let failed = false;
	let buildImagesBeforeSuite = !options.skipBuild;
	for ( const suiteName of suiteNames ) {
		printSuiteHeading( suiteName );
		if ( buildImagesBeforeSuite ) {
			await buildImages();
			console.log( '✅ All image builds are current.' );
			buildImagesBeforeSuite = false;
		}
		const exitCode = await runWdio(
			getSuiteConfigFilePath( suiteName ),
			wdioOptions
		);
		failed = failed || ( exitCode !== 0 );
	}

	if ( failed ) {
		process.exitCode = 1;
	}
}

export async function runWdio(
	configFilePath: string,
	wdioOptions: WdioOptions
): Promise<number> {
	try {
		logger.clearLogger();
		return await new Launcher( configFilePath, wdioOptions ).run();
	} catch ( error ) {
		throw new Error(
			`Failed to start the test suite: ${ error instanceof Error ? error.stack : error }`
		);
	}
}

async function main(): Promise<void> {
	const program = new Command();
	program
		.name( 'wbs-dev test' )
		.description( 'Run Wikibase Suite browser integration tests.' )
		.argument( '[suites...]', 'Suite names, "all", or no names for every suite' )
		.option(
			'--setup',
			'Start and leave up one suite environment without running tests'
		)
		.option(
			'--skip-build',
			'Skip the image build performed before the selected test suites'
		)
		.option( '--headed', 'Run tests in a headed browser' )
		.option( '-d, --debug', 'Use debugging timeouts' )
		.option(
			'--node-debug',
			'Use debugging timeouts and enable the Node inspector'
		)
		.showHelpAfterError()
		.showSuggestionAfterError();

	addWdioOptions( program );
	program.addHelpText(
		'after',
		`

Available project suites:
  ${ allSuiteNames.join( ', ' ) }

Additional wbs-dev target:
  tooling (fast task-runner and release fixtures)

Examples:
  wbs-dev test
  wbs-dev test repo queryservice --headed
  wbs-dev test repo --spec suites/repo/specs/special-new-item.ts
  wbs-dev test repo --setup
  wbs-dev test all --shard 1/2`
	);
	program.action( runSuites );

	const argv = process.argv.map( ( argument ) =>
		argument === '--debug=node' ? '--node-debug' : argument
	);
	await program.parseAsync( argv );
}

main().catch( ( error ) => {
	console.error(
		error instanceof Error ? `wbs-dev test: ${ error.message }` : error
	);
	process.exitCode = process.exitCode || 1;
} );
