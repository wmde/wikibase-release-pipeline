import { confirm, isCancel } from '@clack/prompts';
import { Option, type Command } from 'commander';
import process from 'node:process';
import type { GeneratedPasswordFlags } from '../cli/configure.js';
import {
	installerSessionIsRunning,
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

async function claimTerminalInstallation(): Promise<boolean> {
	if ( !await installerSessionIsRunning() ) {
		return true;
	}
	if ( !process.stdin.isTTY ) {
		throw new Error(
			'A web installation is already running. Stop it with "wbs reset --force" ' +
			'before configuring from a non-interactive session.'
		);
	}
	const answer = await confirm( {
		message: 'A Wikibase Suite web installation is running. Stop it and continue in the terminal?',
		initialValue: false
	} );
	if ( isCancel( answer ) || !answer ) {
		console.log( 'Installation canceled.' );
		return false;
	}
	await stopInstallerSession();
	console.log( 'The Wikibase Suite web installer was stopped.' );
	return true;
}

export async function configure( options: ConfigureOptions ): Promise<ConfigureResult | false> {
	process.env.LOCALHOST = String( options.local );
	process.env.DEBUG = String( options.debug );
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
	if ( !await claimTerminalInstallation() ) {
		return false;
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
