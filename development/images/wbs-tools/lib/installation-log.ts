import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import type { InstallationStatusCode } from './installation-status.js';

export const INSTALLATION_LOG_PATH = process.env.INSTALLATION_LOG_PATH ||
	'/app/installation.log';

export function formatInstallationLogEntry( message: string, code?: InstallationStatusCode ): string {
	return `${ new Date().toISOString() } ${ message }${ code ? ` [${ code }]` : '' }\n`;
}

export function appendInstallationLog(
	message: string,
	code?: InstallationStatusCode,
	logPath: string = INSTALLATION_LOG_PATH
): void {
	mkdirSync( dirname( logPath ), { recursive: true } );
	writeFileSync( logPath, formatInstallationLogEntry( message, code ), { flag: 'a' } );
}

export function clearInstallationLog( logPath: string = INSTALLATION_LOG_PATH ): void {
	if ( existsSync( logPath ) ) {
		rmSync( logPath );
		console.log( '🧹 Installation log cleared' );
	}
}
