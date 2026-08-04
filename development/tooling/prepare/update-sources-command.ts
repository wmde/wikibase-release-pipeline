import type { Command } from 'commander';
import type { RepositoryContext } from '../context.js';
import { resolveNames } from '../selection.js';
import { applyFileUpdates, type FileUpdate } from './files.js';
import { planSourceUpdate, sourceUpdateImages } from './source-providers.js';

async function updateSources(
	requested: string[],
	context: RepositoryContext
): Promise<void> {
	const selected = resolveNames( requested, sourceUpdateImages, {
		command: 'update-sources',
		noun: 'image',
		requireExplicit: true
	} );
	const updates: FileUpdate[] = [];
	for ( const image of selected ) {
		updates.push( await planSourceUpdate( context, image ) );
	}
	const changed = applyFileUpdates( updates );
	if ( changed > 0 ) {
		console.log(
			'Applied available source updates. Nothing was staged, committed, tagged, or pushed. Review with git diff.'
		);
	}
}

export function registerUpdateSourcesCommand(
	program: Command,
	context: RepositoryContext
): void {
	program
		.command( 'update-sources' )
		.description( 'Update upstream commit pins in local, unstaged files.' )
		.argument( '<images...>', 'IMAGE...|all' )
		.addHelpText(
			'after',
			`\nImages:\n  ${ sourceUpdateImages.join( ', ' ) }\n  Select one or more images, or "all" by itself.`
		)
		.action(
			async ( requested: string[] ) => await updateSources( requested, context )
		);
}
