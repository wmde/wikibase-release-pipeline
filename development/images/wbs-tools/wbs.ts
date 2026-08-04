import { confirm, isCancel } from '@clack/prompts';
import { Command, Option } from 'commander';
import process from 'node:process';
import {
	down,
	missingConfigurationKeys,
	reset,
	status,
	up
} from './shared/compose.js';
import { completeWebInstallation } from './shared/installation.js';
import { prepareRepository } from './shared/repository.js';

type ConfigureOptions = {
	web: boolean;
	local: boolean;
	debug: boolean;
};

async function configure( options: ConfigureOptions ): Promise<void> {
	if ( process.env.WBS_VALIDATE_OPTIONS === 'true' ) {
		return;
	}
	process.env.LOCALHOST = String( options.local );
	process.env.DEBUG = String( options.debug );
	if ( options.web ) {
		await import( './web/server.js' );
		return;
	}
	const { configureFromTerminal } = await import( './cli/configure.js' );
	await configureFromTerminal();
}

function configureOptions( command: Command ): Command {
	return command
		.addOption( new Option( '--web', 'Use the browser configurator.' ) )
		.addOption( new Option( '--local', 'Use local hostnames without public DNS validation.' ) )
		.addOption( new Option( '--debug', 'Show verbose diagnostic output.' ) );
}

async function main(): Promise<void> {
	const program = new Command();
	program
		.name( 'wbs' )
		.description( 'Install and operate Wikibase Suite.' )
		.showHelpAfterError()
		.showSuggestionAfterError();

	configureOptions( program.command( 'configure' )
		.description( 'Create or update Wikibase Suite configuration.' ) )
		.action( configure );

	configureOptions( program.command( 'install' )
		.description( 'Configure and install Wikibase Suite.' ) )
		.addOption( new Option( '--from-source', 'Build and install images from this checkout.' ) )
		.action( async ( options: ConfigureOptions & { fromSource: boolean } ) => {
			await configure( options );
			if ( !options.web ) {
				await up( options.fromSource ? { build: true } : { update: true } );
			}
		} );

	program.command( 'install-worker', { hidden: true } )
		.option( '--local-images' )
		.option( '--build' )
		.action( completeWebInstallation );

	program.command( 'prepare' )
		.description( 'Clone a Wikibase Suite release into a host-mounted directory.' )
		.requiredOption( '--target <path>' )
		.option( '--repository <url>', 'WBS Git repository.', 'https://github.com/wmde/wikibase-suite.git' )
		.option( '--ref <ref>', 'Branch or release tag.' )
		.action( prepareRepository );

	program.command( 'up' )
		.description( 'Start the configured Wikibase Suite.' )
		.addOption( new Option( '--update', 'Pull selected images before starting.' ) )
		.addOption( new Option( '--build', 'Build and select images from this checkout.' ) )
		.action( async ( options: { update?: boolean; build?: boolean } ) => {
			const missing = missingConfigurationKeys();
			if ( missing.length ) {
				if ( !process.stdin.isTTY ) {
					throw new Error( `Suite configuration is incomplete. Missing: ${ missing.join( ', ' ) }.` );
				}
				console.log( 'Suite configuration is incomplete; resuming configuration.' );
				await configure( {
					web: false,
					local: options.build === true,
					debug: false
				} );
			}
			await up( options );
		} );

	program.command( 'down' )
		.description( 'Stop Wikibase Suite while preserving its data.' )
		.action( down );
	program.command( 'status' )
		.description( 'Show Wikibase Suite service status.' )
		.action( status );
	program.command( 'reset' )
		.description( 'Delete Suite data and generated configuration.' )
		.addOption( new Option( '--force', 'Skip confirmation for automation.' ) )
		.action( async ( options: { force?: boolean } ) => {
			if ( !options.force ) {
				if ( !process.stdin.isTTY ) {
					throw new Error( 'reset requires confirmation; rerun with --force for automation.' );
				}
				const answer = await confirm( {
					message: 'Permanently delete all Wikibase Suite data and generated configuration?',
					initialValue: false
				} );
				if ( isCancel( answer ) || !answer ) {
					console.log( 'Reset canceled.' );
					return;
				}
			}
			await reset();
			console.log( 'Wikibase Suite data and generated configuration were removed.' );
		} );

	if ( process.argv.length === 2 ) {
		program.help();
	}
	await program.parseAsync( process.argv );
}

void main().catch( ( error ) => {
	console.error( error instanceof Error ? `wbs: ${ error.message }` : error );
	process.exitCode = 1;
} );
