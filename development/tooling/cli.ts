import { Command } from 'commander';
import process from 'node:process';
import { registerBuildCommand } from './build/command.js';
import { createRepositoryContext } from './context.js';
import { registerLintCommand } from './lint/command.js';
import { registerUpdateSourcesCommand } from './prepare/update-sources-command.js';
import { registerUpdateVersionsCommand } from './prepare/update-versions-command.js';
import { registerReleaseCommand } from './release/command.js';
import { registerTestCommand } from './test/command.js';

async function main(): Promise<void> {
	const context = createRepositoryContext();
	const program = new Command();
	program
		.name( 'wbs-dev' )
		.description(
			'Build, test, lint, update, and publish Wikibase Suite projects.'
		)
		.showHelpAfterError()
		.showSuggestionAfterError()
		.enablePositionalOptions();

	registerBuildCommand( program, context );
	registerTestCommand( program, context );
	registerLintCommand( program, context );
	registerUpdateSourcesCommand( program, context );
	registerUpdateVersionsCommand( program, context );
	registerReleaseCommand( program, context );

	program.addHelpText(
		'after',
		[
			'',
			'Preparation commands update local, unstaged files for review.',
			'Publication commands validate committed state before creating tags.',
			'',
			'Examples:',
			'  wbs-dev build',
			'  wbs-dev test',
			'  wbs-dev lint',
			'  wbs-dev update-sources wikibase quickstatements',
			'  wbs-dev update-versions wikibase wbs',
			'  wbs-dev release all --dry-run'
		].join( '\n' )
	);

	if ( process.argv.length === 2 ) {
		program.help();
	}
	const argv = process.argv.map( ( argument ) =>
		argument === '--debug=node' ? '--node-debug' : argument
	);
	await program.parseAsync( argv );
}

main().catch( ( error ) => {
	console.error( error instanceof Error ? `wbs-dev: ${ error.message }` : error );
	process.exitCode = process.exitCode || 1;
} );
