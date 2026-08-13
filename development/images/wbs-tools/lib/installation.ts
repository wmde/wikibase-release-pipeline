import { existsSync, rmSync } from 'node:fs';
import { setTimeout as delay } from 'node:timers/promises';
import { up } from './compose.js';
import { appendInstallationLog } from './installation-log.js';
import { INSTALLATION_STATUS } from './installation-status.js';

export async function completeWebInstallation( options: {
	localImages?: boolean;
	build?: boolean;
} ): Promise<void> {
	const requestPath = process.env.LAUNCH_TRIGGER_PATH;
	if ( !requestPath ) {
		throw new Error( 'LAUNCH_TRIGGER_PATH is required by the installation worker.' );
	}
	while ( !existsSync( requestPath ) ) {
		await delay( 500 );
	}
	rmSync( requestPath, { force: true } );
	appendInstallationLog( 'Configuration saved.', INSTALLATION_STATUS.configSaved );
	appendInstallationLog( 'Updating Docker images...', INSTALLATION_STATUS.imagesPullStarted );
	try {
		await up( {
			...( options.build ? { build: true } : {
				update: true,
				localImages: options.localImages
			} ),
				onStartingServices: () => appendInstallationLog(
				'Starting Docker Compose services. Generally takes 2–6 minutes...',
				INSTALLATION_STATUS.servicesWaiting
			)
		} );
	} catch ( error ) {
		const detail = error instanceof Error ? error.message : String( error );
		appendInstallationLog( `Installation failed: ${ detail }`, INSTALLATION_STATUS.failed );
		throw error;
	}
	appendInstallationLog( 'Docker Compose services reported ready.', INSTALLATION_STATUS.servicesReady );
	appendInstallationLog( 'Installation is complete.', INSTALLATION_STATUS.complete );
}
