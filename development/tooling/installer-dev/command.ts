import type { Command } from 'commander';
import type { RepositoryContext } from '../context.js';
import { runInstallerDevWeb } from './web.js';

export function registerInstallerDevCommand(
	program: Command,
	context: RepositoryContext
): void {
	program
		.command( 'installer-dev' )
		.description( 'Develop and manually exercise the WBS installer.' )
		.command( 'web' )
		.description( 'Start the browser installer with live reload.' )
		.action( async () => await runInstallerDevWeb( context ) );
}
