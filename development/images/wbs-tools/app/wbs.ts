import { Command, Option } from 'commander';
import process from 'node:process';

type InstallOptions = {
	web: boolean;
	local: boolean;
	debug: boolean;
	fromSource: boolean;
};

async function runInstall( options: InstallOptions ): Promise<void> {
	if ( process.env.WBS_VALIDATE_OPTIONS === 'true' ) {
		return;
	}

	process.env.LOCALHOST = String( options.local );
	process.env.DEBUG = String( options.debug );
	if ( options.web ) {
		await import( './server.js' );
	} else {
		await import( './cli.js' );
	}
}

async function main(): Promise<void> {
	const program = new Command();
	program
		.name( 'wbs' )
		.description( 'Install and operate Wikibase Suite.' )
		.showHelpAfterError()
		.showSuggestionAfterError();

	program
		.command( 'install' )
		.description( 'Configure and install Wikibase Suite.' )
		.addOption( new Option( '--web', 'Use the browser installer.' ) )
		.addOption(
			new Option(
				'--local',
				'Use local hostnames without public DNS validation.'
			)
		)
		.addOption(
			new Option(
				'--from-source',
				'Build and install the images from the selected source checkout.'
			)
		)
		.addOption( new Option( '--debug', 'Show verbose diagnostic output.' ) )
		.action( runInstall );

	if ( process.argv.length === 2 ) {
		program.help();
	}

	await program.parseAsync( process.argv );
}

void main().catch( ( error ) => {
	console.error( error instanceof Error ? `wbs: ${ error.message }` : error );
	process.exitCode = 1;
} );
