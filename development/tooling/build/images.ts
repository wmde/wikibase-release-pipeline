import type { RepositoryContext } from '../context.js';
import { discoverImageNames } from '../projects.js';
import { runTasks } from '../tasks.js';

export const DEFAULT_BUILD_PARALLELISM = 3;

export async function buildImages(
	images: string[],
	forwarded: string[],
	context: RepositoryContext,
	parallel = DEFAULT_BUILD_PARALLELISM
): Promise<void> {
	await runTasks(
		images.map( ( image ) => ( {
			label: `build ${ image }`,
			command: 'tooling/build/image.sh',
			args: [ image, ...forwarded ]
		} ) ),
		{ cwd: context.developmentRoot, parallel }
	);
}

export async function buildAllImages(
	context: RepositoryContext
): Promise<void> {
	await buildImages( discoverImageNames( context ), [], context );
}
