import type { Command } from 'commander';
import { buildAllImages } from '../build/images.js';
import type { RepositoryContext } from '../context.js';
import { SuiteEnvironment } from './environment.js';

interface SuiteUpOptions {
	build?: boolean;
	local?: boolean;
}

export function registerSuiteCommand(
	program: Command,
	context: RepositoryContext
): void {
	const environment = new SuiteEnvironment( context, {
		buildImages: async () => await buildAllImages( context )
	} );
	const suite = program
		.command( 'suite' )
		.description( 'Run and manage a Wikibase Suite instance.' );

	suite
		.command( 'up' )
		.description( 'Start the Suite from the repository-root configuration.' )
		.option( '--local', 'Use product images built from this checkout.' )
		.option( '--build', 'Build product images, then start with --local.' )
		.action(
			async ( options: SuiteUpOptions ) => await environment.up( options )
		);

	suite
		.command( 'down' )
		.description( 'Stop the Suite while preserving its data.' )
		.action( async () => await environment.down() );

	suite
		.command( 'status' )
		.description( 'Show the current Suite service status.' )
		.action( async () => await environment.status() );

	suite
		.command( 'reset' )
		.description( 'Delete Suite data and generated configuration.' )
		.action( async () => await environment.reset() );
}
