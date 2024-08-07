/* eslint-disable es-x/no-string-prototype-matchall, security/detect-non-literal-fs-filename */
import fs from 'fs';
import axios from 'axios';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import path from 'path';
import { fileURLToPath } from 'url';

const gerritPattern = /# (https:\/\/gerrit.*)[ \t\r\n]*([A-Z_]+_COMMIT)=([0-9a-f]+)/g;
const githubPattern = /# (https:\/\/github\.com\/(.+\/commits.*))[ \t\r\n]*([A-Z_]+_COMMIT)=([0-9a-f]+)/g;
const bitbucketPattern = /# (https:\/\/bitbucket\.org\/(.+\/commits))\/branch\/master?[ \t\r\n]*([A-Z_]+_COMMIT)=([0-9a-f]+)/g;

async function getCommit(
	variable: string,
	url: string,
	parseCommit: ( response: Record<string, unknown> | string ) => string,
	previousCommit: string
): Promise<string | false> {
	console.log( `Variable:\t${ variable }` );
	console.log( `\tURL:\t${ url }` );

	try {
		const response = await axios.get( url );
		const commit = parseCommit( response.data );
		if ( previousCommit !== commit ) {
			console.log( `\tOld Commit:\t${ previousCommit }` );
			console.log( `\tNew Commit:\t${ commit }` );
			return commit;
		} else {
			console.log( `\tCommit:\t${ commit }` );
			return false;
		}
	} catch ( error ) {
		console.error( `\tError:\t${ error.message }` );
		return false;
	}
}

function parseGerritCommit( response: string ): string {
	// Remove the ")]}'" prefix from the response
	const jsonString = response.replace( /^\)]\}'/, '' );
	const data = JSON.parse( jsonString );
	return data.commit;
}

function parseGithubCommit( response: Record<string, string> ): string {
	return response.sha;
}

function parseBitbucketCommit(
	response: Record<string,
	[Record<string, string>]>
): string {
	return response.values[ 0 ].hash;
}

async function run( filePath: string ): Promise<void> {
	if ( !fs.existsSync( filePath ) ) {
		console.error( `File ${ filePath } does not exist.` );
		return;
	}

	console.log( `Processing ${ filePath }` );
	let variableContents = fs.readFileSync( filePath, 'utf8' );

	const mediawikiMatch = /MEDIAWIKI_VERSION=(\d+)\.(\d+)/.exec( variableContents );
	if ( mediawikiMatch ) {
		const rel = `REL${ mediawikiMatch[ 1 ] }_${ mediawikiMatch[ 2 ] }`;
		console.log( `Mediawiki Version:\t${ mediawikiMatch[ 1 ] }.${ mediawikiMatch[ 2 ] }` );
		variableContents = variableContents.replace( /\bREL\d+_\d+/, rel );
	}

	const gerritMatches = Array.from( variableContents.matchAll( gerritPattern ) );
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	for ( const [ _, url, variable, previousCommit ] of gerritMatches ) {
		const commit = await getCommit( variable, url, parseGerritCommit, previousCommit );
		if ( commit ) {
			// eslint-disable-next-line security/detect-non-literal-regexp
			variableContents = variableContents.replace( new RegExp( `${ variable }=[0-9a-f]+` ), `${ variable }=${ commit }` );
		}
	}

	const githubMatches = Array.from( variableContents.matchAll( githubPattern ) );
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	for ( const [ _, url, repo, variable, previousCommit ] of githubMatches ) {
		const commit = await getCommit( variable, `https://api.github.com/repos/${ repo }`, parseGithubCommit, previousCommit );
		if ( commit ) {
			// eslint-disable-next-line security/detect-non-literal-regexp
			variableContents = variableContents.replace( new RegExp( `${ variable }=[0-9a-f]+` ), `${ variable }=${ commit }` );
		}
	}

	const bitbucketMatches = Array.from( variableContents.matchAll( bitbucketPattern ) );
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	for ( const [ _, url, repo, variable, previousCommit ] of bitbucketMatches ) {
		const commit = await getCommit( variable, `https://bitbucket.org/!api/2.0/repositories/${ repo }`, parseBitbucketCommit, previousCommit );
		if ( commit ) {
			// eslint-disable-next-line security/detect-non-literal-regexp
			variableContents = variableContents.replace( new RegExp( `${ variable }=[0-9a-f]+` ), `${ variable }=${ commit }` );
		}
	}

	fs.writeFileSync( filePath, variableContents, 'utf8' );
}

// eslint-disable-next-line no-underscore-dangle
const __filename = fileURLToPath( import.meta.url );
// eslint-disable-next-line no-underscore-dangle
const __dirname = path.dirname( __filename );

const argv = yargs( hideBin( process.argv ) ).argv;

const envfilePath = path.join( __dirname, argv._[ 0 ] ) as string;

if ( !envfilePath ) {
	console.error( 'Usage: ts-node script.ts <path_to_env_file>' );
	throw new Error( 'Missing file path argument.' );
}

run( envfilePath ).catch( ( error ) => {
	console.error( `Error: ${ error.message }` );
} );
