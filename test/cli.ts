/* eslint-disable no-use-before-define */
import { Launcher, RunCommandArguments } from '@wdio/cli';
import lodash from 'lodash';
import chalk from 'chalk';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { versions } from './suites/upgrade/versions.js';

export const allSuiteNames = [
	'repo',
	'fedprops',
	'repo_client',
	'quickstatements',
	'pingback',
	'confirm_edit',
	'elasticsearch',
	'base__repo',
	'base__repo_client',
	'base__pingback',
	'base__fedprops',
	'example'
];

const y = yargs( hideBin( process.argv ) );

const runCLI = async (): Promise<{
	[x: string]: unknown;
	_: ( string | number )[];
	$0: string;
}> => {
	y.command(
		'*<suiteName>',
		'Run a test suite',
		( yy ) => {
			yy.positional( 'suiteName', {
				describe: 'Name of the test suite to run or setup',
				type: 'string',
				choices: allSuiteNames
			} );
		},
		commandHandler
	);

	y.command(
		'upgrade <fromVersion> [toVersion]',
		'run upgrade test',
		( yy ) => {
			yy.positional( 'fromVersion', {
				describe: 'Version to upgrade FROM in the upgrade test',
				type: 'string',
				choices: Object.keys( versions ),
				requiresArg: true
			} );
			yy.positional( 'toVersion', {
				describe: 'Version to upgrade TO in the upgrade test',
				type: 'string',
				choices: Object.keys( versions ),
				requiresArg: true
			} );
		},
		commandHandler
	);

	y.command(
		'all',
		'Run all test suites',
		{},
		commandHandler
	);

	y.options( {
		debug: {
			boolean: true,
			choices: [ true, 'node' ],
			alias: 'd',
			description: 'Run tests with long timeouts for debugging. Optionally set to "node" to also enable Node inspector.'
		},

		setup: {
			boolean: true,
			description: 'Start and leave-up the test environment without running tests'
		},

		headedTests: {
			boolean: true,
			alias: 'headed',
			description: 'Run tests in a headed browser'
		},

		spec: {
			array: true,
			description: 'Run only this spec file(s) using the selected test suite setup (WDIO)',
			requiresArg: true,
			conflicts: [ 'setup' ]
		},

		watch: {
			boolean: true,
			description: 'Automatically re-run tests when spec files in the suite change (WDIO)',
			conflicts: [ 'setup' ]
		}
	} );

	y.version( '1.0.0' );
	y.scriptName( './test.sh' );
	y.wrap( 120 );
	y.demandCommand();
	y.showHelpOnFail( true );
	y.help();

	return y.argv;
};

function prepareWdioRunCommandOptions( argv ): Record<string, string> {
	const options = Object.assign( {}, argv );
	delete options._;
	delete options.$0;

	for ( const [ key, value ] of Object.entries( options ) ) {
		if ( [ 'fromVersion', 'toVersion', 'headedTests', 'debug' ].includes( key ) ) {
			process.env[ `${lodash.toUpper( lodash.snakeCase( key.toString() ) )}` ] = value.toString();
			delete options[ key ];
		}
	}

	return options;
}

const commandHandler = async ( argv ): Promise<void> => {
	if ( argv._.length < 1 ) {
		y.showHelp();
		return;
	}
	const wdioRunCommandOptions = prepareWdioRunCommandOptions( argv );
	const suiteNames = argv._[ 0 ] === 'all' ? allSuiteNames : argv._.map( ( suiteName ) => suiteName.toString() );
	let exitCode;

	if ( argv.setup ) {
		// eslint-disable-next-line es-x/no-dynamic-import
		const { testEnv } = await import( `./suites/${suiteNames[ 0 ]}/${suiteNames[ 0 ]}.conf.ts` );
		await testEnv.up();
		exitCode = 0;
	} else {
		if ( suiteNames.length > 1 ) {
			console.log(
				chalk.whiteBright.bold( `\n🎡 Running ${suiteNames.length} test suites:` ),
				chalk.whiteBright( suiteNames.join( ', ' )
				) );
		}
		for ( const suiteName of suiteNames ) {
			const configFilePath = `./suites/${suiteName}/${suiteName}.conf.ts`;
			console.log(
				chalk.bgWhiteBright.black.bold(
					`\n"${suiteName}" test suite ${' '.repeat( 96 - suiteName.length )}`
				)
			);
			exitCode = await runWdio( configFilePath, wdioRunCommandOptions );
		}
	}
	// eslint-disable-next-line no-process-exit
	process.exit( exitCode );
};

export async function runWdio(
	configFilePath: string,
	wdioOpts: Partial<RunCommandArguments>
): Promise<number> {
	try {
		const wdio = new Launcher(
			configFilePath,
			wdioOpts
		);
		return wdio.run();
	} catch ( e ) {
		throw new Error( 'Failed to start the test suite: ' + e.stacktrace );
	}
}

// eslint-disable-next-line es-x/no-top-level-await
await ( async () => await runCLI() )();
