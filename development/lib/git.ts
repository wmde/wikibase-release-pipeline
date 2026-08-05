import { spawnSync } from 'node:child_process';
import type { RepositoryContext } from './context.js';

export class GitRepository {
	private remoteTagCache: Map<string, string> | undefined;

	public constructor( private readonly context: RepositoryContext ) {}

	public run( args: string[], options: { allowFailure?: boolean } = {} ): string {
		const result = spawnSync( 'git', args, {
			cwd: this.context.repositoryRoot,
			encoding: 'utf8'
		} );
		if ( result.status !== 0 && !options.allowFailure ) {
			throw new Error(
				`git ${ args.join( ' ' ) } failed: ${ ( result.stderr || result.stdout ).trim() }`
			);
		}
		return result.status === 0 ? result.stdout.trim() : '';
	}

	public fetchRemoteTags(): void {
		this.run( [
			'fetch',
			'origin',
			'+refs/heads/*:refs/remotes/origin/*',
			'+refs/tags/*:refs/tags/*'
		] );
		this.remoteTagCache = undefined;
	}

	public remoteTagCommit( tag: string ): string | undefined {
		return this.remoteTags().get( tag );
	}

	public remoteTags(): Map<string, string> {
		if ( this.remoteTagCache ) {
			return this.remoteTagCache;
		}
		this.remoteTagCache = new Map(
			this.run( [ 'ls-remote', '--tags', '--refs', 'origin' ] )
				.split( '\n' )
				.filter( Boolean )
				.map( ( line ) => {
					const [ commit, reference ] = line.split( /\s+/u );
					return [ reference.replace( 'refs/tags/', '' ), commit ];
				} )
		);
		return this.remoteTagCache;
	}
}
