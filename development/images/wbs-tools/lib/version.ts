import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseEnv } from 'node:util';

const repositoryRoot = process.env.WBS_DIR || '/app/wbs';

function readEnvFile( path: string ): Record<string, string> {
	return existsSync( path ) ? parseEnv( readFileSync( path, 'utf8' ) ) : {};
}

function git( args: string[] ): string {
	try {
		return execFileSync( 'git', [ '-C', repositoryRoot, ...args ], {
			encoding: 'utf8',
			stdio: [ 'ignore', 'pipe', 'ignore' ]
		} ).trim();
	} catch {
		return '';
	}
}

function suiteVersion(): { display: string; commit: string } {
	const release = readEnvFile( join( repositoryRoot, '.wbs/version' ) ).WBS_VERSION || 'unknown';
	const commit = git( [ 'rev-parse', 'HEAD' ] );
	const modified = Boolean( git( [ 'status', '--porcelain' ] ) );
	const releaseTag = `wbs@${ release }`;
	const isRelease = git( [ 'tag', '--points-at', 'HEAD' ] )
		.split( '\n' )
		.includes( releaseTag );
	if ( !commit || ( isRelease && !modified ) ) {
		return { display: release, commit };
	}
	return {
		display: `${ release } (${ commit.slice( 0, 12 ) }${ modified ? ', modified' : '' })`,
		commit
	};
}

export function versionText(): string {
	const suite = suiteVersion();
	const releaseManifest = readEnvFile( join( repositoryRoot, '.wbs/version' ) );
	const installManifest = readEnvFile( join( repositoryRoot, '.wbs/install.env' ) );
	const toolsVersion = process.env.WBS_TOOLS_VERSION || 'unknown';
	const toolsImage = process.env.WBS_TOOLS_IMAGE || '';
	const toolsQualifier = toolsImage && toolsImage !== releaseManifest.WBS_TOOLS_IMAGE ?
		` (${ toolsImage })` : '';
	const lines = [
		`Wikibase Suite: ${ suite.display }`,
		`WBS Tools:      ${ toolsVersion }${ toolsQualifier }`
	];
	const installationCommit = installManifest.WBS_INSTALL_SOURCE_COMMIT || '';
	if ( installationCommit && suite.commit && installationCommit !== suite.commit ) {
		lines.push(
			'',
			`Installation images were selected for ${ installationCommit.slice( 0, 12 ) }; ` +
				'the checkout differs.'
		);
	}
	return lines.join( '\n' );
}
