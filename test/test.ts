import { Launcher, RunCommandArguments } from '@wdio/cli';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import loadEnvVars from './helpers/loadEnvVars.js';

loadEnvVars( './default.env' );
loadEnvVars( '../local.env' );

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

y.command( [ '*<suiteName>', 'all' ], 'run a set of test suite(s) or all suites', {}, async ( argv ) => {
	if ( argv._.length < 1 ) {
		y.showHelp();
		return;
	}
	const wdioCommandArguments: Partial<RunCommandArguments> = getOptions( argv );
	const suiteNames: string[] = argv._[ 0 ] === 'all' ? allSuiteNames : argv._.map( ( suiteName ) => suiteName.toString() );
	let exitCode;
	for ( const suiteName of suiteNames ) {
		exitCode = await runWdio( suiteName, wdioCommandArguments );
	}
	// eslint-disable-next-line no-process-exit
	process.exit( exitCode );
} );

y.command( 'upgrade <fromVersion>', 'run the upgrade test suite', {}, async ( argv ) => {
	const options = getOptions( argv );
	process.env.FROM_VERSION = options.fromVersion.toString();
	delete options.fromVersion;
	const wdioCommandArguments: Partial<RunCommandArguments> = options;
	const exitCode = await runWdio( argv._[ 0 ].toString(), wdioCommandArguments );
	// eslint-disable-next-line no-process-exit
	process.exit( exitCode );
} );

y.option( 'spec', {
	array: true,
	description: 'run only this spec file(s) using the selected test suite setup (WDIO)'
} );

y.option( 'watch', {
	boolean: true,
	description: 'automatically re-run tests when spec files in the suite change (WDIO)'
} );

y.version( '1.0.0' );
y.scriptName( './test.sh' );
y.help();
y.wrap( y.terminalWidth() );
y.demandCommand();
y.showHelpOnFail( true );

( async () => await y.argv )();

function getOptions( argv ): Partial<RunCommandArguments> & Record<string, unknown> {
	const options = Object.assign( {}, argv );
	delete options._;
	delete options.$0;
	return options;
}

async function runWdio(
	suiteName: string,
	wdioOpts: Partial<RunCommandArguments>
): Promise<number> {
	try {
		const wdio = new Launcher(
			`./suites/${suiteName}/${suiteName}.conf.ts`,
			wdioOpts
		);
		return wdio.run();
	} catch ( e ) {
		throw new Error( 'Failed to start the test suite: ' + e.stacktrace );
	}
}
