import type { Command } from 'commander';
import { buildAllImages } from '../build/images.js';
import type { RepositoryContext } from '../context.js';
import { SuiteEnvironment } from './environment.js';

interface SuiteUpOptions {
	build?: boolean;
	published?: boolean;
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
		.description( 'Run and manage a Wikibase Suite instance.' )
		.addHelpText(
			'after',
			[
				'',
				'Commands use the repository-root .env, docker-compose.yml, and optional',
				'docker-compose.local.yml.',
				'',
				'Examples:',
				'  wbs-dev suite up',
				'  wbs-dev suite status',
				'  wbs-dev suite down',
				'  wbs-dev suite reset'
			].join( '\n' )
		);

	suite
		.command( 'up' )
		.description( 'Start the Suite from the repository-root configuration.' )
		.option( '--no-build', 'Use existing local WBS images without rebuilding.' )
		.option( '--published', 'Use configured published images instead of local builds.' )
		.addHelpText(
			'after',
			[
				'',
				'Uses the local-image Compose override, pulls upstream service images, builds',
				'every WBS product image from the current checkout, and then starts the Suite.',
				'The local override prevents Compose from pulling the WBS product images.',
				'--no-build skips the build and requires those local images to exist already.',
				'--published omits the local-image override and build, allowing the configured',
				'Docker Hub images to be tested. A root docker-compose.local.yml remains last.',
				'',
				'Examples:',
				'  wbs-dev suite up',
				'  wbs-dev suite up --no-build',
				'  wbs-dev suite up --published'
			].join( '\n' )
		)
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
		.addHelpText(
			'after',
			[
				'',
				'This permanently removes Compose volumes and generated files under config/.',
				'The Suite remains stopped; run suite up explicitly to start a fresh instance.'
			].join( '\n' )
		)
		.action( async () => await environment.reset() );
}
