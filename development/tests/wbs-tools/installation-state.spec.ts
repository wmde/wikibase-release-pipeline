import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
	classifyExistingInstallState,
	inspectInstallationAttempt,
	installationAttemptStarted
} from '../../images/wbs-tools/lib/installation-state.js';

describe( 'Installer state decisions', () => {
	it( 'reads current-attempt facts from the installation log and launch request', () => {
		const stateRoot = mkdtempSync( join( tmpdir(), 'wbs-installation-state-' ) );
		try {
			const logPath = join( stateRoot, 'installation.log' );
			const triggerPath = join( stateRoot, 'install-request' );
			writeFileSync(
				logPath,
				[
					'2026-08-12T12:00:00Z Configuration saved. [config_saved]',
					'2026-08-12T12:01:00Z Installation failed. [installation_failed]',
					''
				].join( '\n' )
			);

			const failedAttempt = inspectInstallationAttempt( logPath );
			assert.deepEqual( failedAttempt, {
				configurationSaved: true,
				completed: false,
				failed: true
			} );
			assert.equal( installationAttemptStarted( failedAttempt, '' ), true );

			writeFileSync( logPath, '' );
			writeFileSync( triggerPath, 'ready\n' );
			const requestedAttempt = inspectInstallationAttempt( logPath );
			assert.equal( installationAttemptStarted( requestedAttempt, triggerPath ), true );
		} finally {
			rmSync( stateRoot, { recursive: true, force: true } );
		}
	} );

	it( 'preserves the existing-install precedence used by the web installer', () => {
		const cases = [
			[ true, true, true, 'none' ],
			[ false, true, true, 'running' ],
			[ false, false, true, 'previous' ],
			[ false, false, false, 'none' ]
		] as const;

		for ( const [ lastAttemptFailed, servicesRunning, installedSuiteExists, expected ] of cases ) {
			assert.equal( classifyExistingInstallState( {
				lastAttemptFailed,
				servicesRunning,
				installedSuiteExists
			} ), expected );
		}
	} );
} );
