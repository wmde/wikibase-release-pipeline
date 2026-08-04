import type { Command } from 'commander';
import type { RepositoryContext } from '../context.js';
import { GitRepository } from '../git.js';
import {
	discoverReleaseProjects,
	resolveProjectSelections
} from '../projects.js';
import {
	preflightRelease,
	publishGitTags,
	requireDockerHubImages
} from './publication.js';

async function releaseImages(
	requested: string[],
	dryRun: boolean,
	context: RepositoryContext
): Promise<void> {
	const projects = resolveProjectSelections(
		requested,
		discoverReleaseProjects( context ),
		'release images',
		{ imagesOnly: true }
	);
	const git = new GitRepository( context );
	publishGitTags( git, preflightRelease( git, projects ), dryRun );
}

async function releaseWbs(
	dryRun: boolean,
	context: RepositoryContext
): Promise<void> {
	const projects = discoverReleaseProjects( context );
	const wbs = projects.find( ( project ) => project.name === 'wbs' );
	if ( !wbs ) {
		throw new Error( 'Could not find the WBS release project.' );
	}
	const images = projects.filter( ( project ) => project.isImage );
	const git = new GitRepository( context );
	const targets = preflightRelease( git, [ wbs ] );
	await requireDockerHubImages( images, { wait: false } );
	publishGitTags( git, targets, dryRun );
}

async function releaseAll(
	dryRun: boolean,
	context: RepositoryContext
): Promise<void> {
	const projects = discoverReleaseProjects( context );
	const images = projects.filter( ( project ) => project.isImage );
	const wbs = projects.find( ( project ) => project.name === 'wbs' );
	if ( !wbs ) {
		throw new Error( 'Could not find the WBS release project.' );
	}
	const git = new GitRepository( context );
	const targets = preflightRelease( git, [ ...images, wbs ] );
	const imageTargets = targets.filter( ( target ) => target.project.isImage );
	const wbsTargets = targets.filter( ( target ) => !target.project.isImage );
	publishGitTags( git, imageTargets, dryRun );
	if ( dryRun ) {
		publishGitTags( git, wbsTargets, true );
		console.log(
			'Dry run: WBS publication would wait for every full-version image tag.'
		);
		return;
	}
	await requireDockerHubImages( images, { wait: true } );
	publishGitTags( git, wbsTargets, false );
}

export function registerReleaseCommand(
	program: Command,
	context: RepositoryContext
): void {
	const imageNames = discoverReleaseProjects( context )
		.filter( ( project ) => project.isImage )
		.map( ( project ) => project.name );
	const release = program
		.command( 'release' )
		.description( 'Create and push reviewed release tags.' )
		.action( () => release.help() );
	release
		.command( 'images' )
		.description(
			'Release selected images, or every image when none is selected.'
		)
		.argument( '[images...]' )
		.option( '--dry-run', 'Validate and show tags without creating them.' )
		.addHelpText(
			'after',
			`\nImages:\n  ${ imageNames.join( ', ' ) }\n  With no image, release every image.`
		)
		.action(
			async ( images: string[] | undefined, options: { dryRun?: boolean } ) =>
				await releaseImages( images ?? [], options.dryRun ?? false, context )
		);
	release
		.command( 'wbs' )
		.description( 'Release WBS after confirming every required image exists.' )
		.option( '--dry-run', 'Validate and show the tag without creating it.' )
		.action(
			async ( options: { dryRun?: boolean } ) =>
				await releaseWbs( options.dryRun ?? false, context )
		);
	release
		.command( 'all' )
		.description( 'Release images, wait for publication, and then release WBS.' )
		.option(
			'--dry-run',
			'Validate and show the complete sequence without creating tags.'
		)
		.action(
			async ( options: { dryRun?: boolean } ) =>
				await releaseAll( options.dryRun ?? false, context )
		);
}
