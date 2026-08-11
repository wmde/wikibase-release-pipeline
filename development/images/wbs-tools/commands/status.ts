import type { Command } from 'commander';
import { composeServicesAreRunning, status } from '../lib/compose.js';

async function showStatus(): Promise<void> {
	if ( !await composeServicesAreRunning() ) {
		console.log( 'Wikibase Suite is not currently running.' );
		return;
	}
	await status();
}

export function registerStatusCommand( program: Command ): void {
	program.command( 'status' )
		.description( 'Show Wikibase Suite service status.' )
		.action( showStatus );
}
