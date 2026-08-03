import { spawnSync } from 'node:child_process';
import { REPOSITORY_ROOT } from './projects.js';

let remoteTagCache: Map<string, string> | undefined;

export function git(
	args: string[],
	options: { allowFailure?: boolean } = {}
): string {
	const result = spawnSync( 'git', args, {
		cwd: REPOSITORY_ROOT,
		encoding: 'utf8'
	} );
	if ( result.status !== 0 && !options.allowFailure ) {
		throw new Error(
			`git ${ args.join( ' ' ) } failed: ${ ( result.stderr || result.stdout ).trim() }`
		);
	}
	return result.status === 0 ? result.stdout.trim() : '';
}

export function fetchRemoteTags(): void {
	git( [
		'fetch',
		'origin',
		'+refs/heads/*:refs/remotes/origin/*',
		'+refs/tags/*:refs/tags/*'
	] );
	remoteTagCache = undefined;
}

export function remoteTagCommit( tag: string ): string | undefined {
	return remoteTags().get( tag );
}

export function remoteTags(): Map<string, string> {
	if ( remoteTagCache ) {
		return remoteTagCache;
	}
	remoteTagCache = new Map(
		git( [ 'ls-remote', '--tags', '--refs', 'origin' ] )
			.split( '\n' )
			.filter( Boolean )
			.map( ( line ) => {
				const [ commit, reference ] = line.split( /\s+/u );
				return [ reference.replace( 'refs/tags/', '' ), commit ];
			} )
	);
	return remoteTagCache;
}
