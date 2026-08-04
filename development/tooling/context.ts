import { join, resolve } from 'node:path';

export interface RepositoryContext {
	developmentRoot: string;
	repositoryRoot: string;
	imagesRoot: string;
	testRoot: string;
}

export function createRepositoryContext(
	developmentRoot = process.cwd()
): RepositoryContext {
	return {
		developmentRoot,
		repositoryRoot: resolve( developmentRoot, '..' ),
		imagesRoot: join( developmentRoot, 'images' ),
		testRoot: join( developmentRoot, 'tests' )
	};
}
