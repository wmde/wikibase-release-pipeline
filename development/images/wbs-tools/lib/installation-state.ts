import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { INSTALLATION_LOG_PATH } from './installation-log.js';
import { INSTALLATION_STATUS, installationStatusCode } from './installation-status.js';

const repositoryRoot = process.env.WBS_DIR || '/app/wbs';
const localSettingsFile = join( repositoryRoot, 'config', 'LocalSettings.php' );
export const LAUNCH_TRIGGER_PATH = process.env.LAUNCH_TRIGGER_PATH || '';

const EXISTING_INSTALL_STATES = new Set( [ 'none', 'running', 'previous' ] );

export type ExistingInstallState = 'none' | 'running' | 'previous';

export type InstallationAttemptFacts = {
	configurationSaved: boolean;
	completed: boolean;
	failed: boolean;
};

export function inspectInstallationAttempt(
	logPath: string = INSTALLATION_LOG_PATH
): InstallationAttemptFacts {
	if ( !existsSync( logPath ) ) {
		return { configurationSaved: false, completed: false, failed: false };
	}
	const contents = readFileSync( logPath, 'utf8' );
	const codes = new Set( contents.split( '\n' ).map( installationStatusCode ).filter( Boolean ) );

	return {
		configurationSaved: codes.has( INSTALLATION_STATUS.configSaved ),
		completed: codes.has( INSTALLATION_STATUS.complete ),
		failed: codes.has( INSTALLATION_STATUS.failed )
	};
}

export function installationAttemptStarted(
	facts: InstallationAttemptFacts,
	launchTriggerPath: string = LAUNCH_TRIGGER_PATH
): boolean {
	return ( launchTriggerPath !== '' && existsSync( launchTriggerPath ) ) ||
		facts.configurationSaved;
}

export function configuredExistingInstallState(): ExistingInstallState {
	const configuredState = process.env.EXISTING_INSTALL_STATE || '';
	if ( EXISTING_INSTALL_STATES.has( configuredState ) ) {
		return configuredState as ExistingInstallState;
	}

	// The controller normally supplies EXISTING_INSTALL_STATE. Retain legacy
	// configuration detection for a directly launched installer server.
	return existsSync( localSettingsFile ) ? 'previous' : 'none';
}

export function classifyExistingInstallState( facts: {
	lastAttemptFailed: boolean;
	servicesRunning: boolean;
	installedSuiteExists: boolean;
} ): ExistingInstallState {
	if ( facts.lastAttemptFailed ) {
		return 'none';
	}
	if ( facts.servicesRunning ) {
		return 'running';
	}
	return facts.installedSuiteExists ? 'previous' : 'none';
}
