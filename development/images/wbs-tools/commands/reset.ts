import { confirm, isCancel } from '@clack/prompts';
import { Option, type Command } from 'commander';
import process from 'node:process';
import { configurationExists, missingConfigurationKeys, reset } from '../lib/compose.js';
import {
	installerSessionIsRunning,
	stopInstallerSession
} from '../lib/installer-session.js';

type ResetOptions = {
	force?: boolean;
};

async function resetSuite( options: ResetOptions ): Promise<void> {
	const installerRunning = await installerSessionIsRunning();
	const environmentExists = configurationExists();
	const suiteIsConfigured = missingConfigurationKeys().length === 0;
	if ( !installerRunning && !environmentExists ) {
		console.log( 'There is nothing to reset.' );
		return;
	}
	let stopInstaller = options.force === true && installerRunning;
	let deleteEnvironment = options.force === true && environmentExists;
	let deleteData = options.force === true && suiteIsConfigured;
	if ( options.force !== true ) {
		if ( !process.stdin.isTTY ) {
			throw new Error( 'reset requires confirmation; rerun with --force for automation.' );
		}
		if ( installerRunning ) {
			const installerAnswer = await confirm( {
				message: 'Wikibase Suite web installer is running. Stop it?',
				initialValue: false
			} );
			if ( isCancel( installerAnswer ) ) {
				console.log( 'Reset canceled.' );
				return;
			}
			stopInstaller = installerAnswer;
		}
		if ( suiteIsConfigured ) {
			const dataAnswer = await confirm( {
				message: 'Permanently delete all Wikibase Suite services, data, and generated runtime configuration files?',
				initialValue: false
			} );
			if ( isCancel( dataAnswer ) ) {
				console.log( 'Reset canceled.' );
				return;
			}
			deleteData = dataAnswer;
		}
		if ( environmentExists && ( deleteData || !suiteIsConfigured ) ) {
			const environmentAnswer = await confirm( {
				message: suiteIsConfigured ?
					'Also delete the saved installer configuration in .env?' :
					'Delete the incomplete installer configuration in .env?',
				initialValue: false
			} );
			if ( isCancel( environmentAnswer ) ) {
				console.log( 'Reset canceled.' );
				return;
			}
			deleteEnvironment = environmentAnswer;
		}
		if ( !stopInstaller && !deleteData && !deleteEnvironment ) {
			console.log( 'Nothing was reset.' );
			return;
		}
	}
	if ( stopInstaller ) {
		await stopInstallerSession();
		console.log( 'The Wikibase Suite web installer was stopped.' );
	}
	await reset( {
		environment: deleteEnvironment,
		data: deleteData
	} );
	if ( deleteData ) {
		console.log( 'Wikibase Suite services, data, and generated runtime configuration files were removed.' );
	}
	if ( deleteEnvironment ) {
		console.log( 'Wikibase Suite .env configuration was removed.' );
	}
}

export function registerResetCommand( program: Command ): void {
	program.command( 'reset' )
		.description( 'Stop the web installer or reset Suite services, data, and generated runtime configuration, optionally including .env.' )
		.addOption( new Option( '--force', 'Stop the web installer and delete services, data, generated runtime configuration, and .env without prompting.' ) )
		.action( resetSuite );
}
