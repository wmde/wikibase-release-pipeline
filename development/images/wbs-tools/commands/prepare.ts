import type { Command } from 'commander';
import { prepareRepository } from '../lib/repository.js';

export function registerPrepareCommand( install: Command ): void {
	install.command( 'prepare' )
		.description( 'Clone a Wikibase Suite release into a host-mounted directory.' )
		.requiredOption( '--target <path>' )
		.option( '--repository <url>', 'WBS Git repository.', 'https://github.com/wmde/wikibase-suite.git' )
		.option( '--ref <ref>', 'Branch, release tag, or commit.' )
		.option( '--manifest-url <url>', 'Published installation manifest.' )
		.action( prepareRepository );
}
