import { confirm, isCancel } from '@clack/prompts';
import { Option, type Command } from 'commander';
import process from 'node:process';
import type { GeneratedPasswordFlags } from '../cli/configure.js';
import { installedSuiteExists, reset } from '../lib/compose.js';
import {
	activeInstallerSession,
	stopInstallerSession
} from '../lib/installer-session.js';

export type ConfigureOptions = {
	web: boolean;
	local: boolean;
	debug: boolean;
	configurationOnly?: boolean;
	build?: boolean;
};

export type ConfigureResult = {
	generatedPasswords: GeneratedPasswordFlags;
};

async function claimInstallation( requestedKind: 'cli' | 'web' ): Promise<boolean> {
	const session = await activeInstallerSession();
	if ( !session ) {
		return true;
	}
	const existingDescription = session.kind === 'web' ?
		`A Wikibase Suite web installer is already running${ session.url ? ` at ${ session.url }` : '' }.` :
		'A Wikibase Suite command-line installer is already running.';
	if ( !process.stdin.isTTY ) {
		throw new Error( `${ existingDescription } Stop it before starting another installer.` );
	}
	const answer = await confirm( {
		message: `${ existingDescription } Cancel it and start again ${ requestedKind === 'web' ? 'in the browser' : 'in the terminal' }?`,
		initialValue: false
	} );
	if ( isCancel( answer ) || !answer ) {
		console.log( 'Installation canceled.' );
		return false;
	}
	await stopInstallerSession();
	console.log( 'The existing Wikibase Suite installer was stopped.' );
	return true;
}

async function resetExistingSuite(): Promise<boolean> {
	if ( !await installedSuiteExists() ) {
		return true;
	}
	if ( !process.stdin.isTTY ) {
		throw new Error(
			'An existing Wikibase Suite installation was found. Run "wbs reset" interactively before installing again.'
		);
	}
	const answer = await confirm( {
		message: '⚠️ Permanently delete all Wikibase Suite data and configuration, including .env, then install from scratch?',
		initialValue: false
	} );
	if ( isCancel( answer ) || !answer ) {
		console.log( 'Installation canceled.' );
		return false;
	}
	// This is the same destructive operation used by `wbs reset`; reaching it here
	// requires explicit confirmation of the complete reset scope above.
	await reset( { data: true, environment: true } );
	console.log( 'The existing Wikibase Suite installation was reset.' );
	return true;
}

export async function configure( options: ConfigureOptions ): Promise<ConfigureResult | false> {
	process.env.LOCALHOST = String( options.local );
	process.env.DEBUG = String( options.debug );
	const requestedKind = options.web ? 'web' : 'cli';
	if ( !await claimInstallation( requestedKind ) ) {
		return false;
	}
	if ( options.configurationOnly !== true && !await resetExistingSuite() ) {
		return false;
	}
	if ( options.web ) {
		const { launchWebInstaller } = await import( '../lib/web-installer-controller.js' );
		await launchWebInstaller( {
			configurationOnly: options.configurationOnly === true,
			local: options.local,
			debug: options.debug,
			build: options.build === true
		} );
		return { generatedPasswords: { admin: false, database: false } };
	}
	const { configureFromTerminal } = await import( '../cli/configure.js' );
	return { generatedPasswords: await configureFromTerminal() };
}

export function addConfigureOptions( command: Command ): Command {
	return command
		.addOption( new Option( '--web', 'Use the browser configurator.' ) )
		.addOption( new Option( '--local', 'Use local hostnames without public DNS validation.' ) )
		.addOption( new Option( '--debug', 'Show verbose diagnostic output.' ) );
}

export function registerConfigureCommand( install: Command ): void {
	addConfigureOptions( install.command( 'configure' )
		.description( 'Run only the Wikibase Suite installation configurator.' ) )
		.action( async ( _options: ConfigureOptions, command: Command ) => {
			await configure( {
				...( command.optsWithGlobals() as ConfigureOptions ),
				configurationOnly: true
			} );
		} );
}
