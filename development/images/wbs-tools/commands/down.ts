import type { Command } from 'commander';
import { composeServicesAreRunning, down } from '../lib/compose.js';

async function stopSuite(): Promise<void> {
	if ( !await composeServicesAreRunning() ) {
		console.log( 'Wikibase Suite is not currently running.' );
		return;
	}
	await down();
}

export function registerDownCommand( program: Command ): void {
	program.command( 'down' )
		.description( 'Stop Wikibase Suite while preserving its data.' )
		.action( stopSuite );
}
