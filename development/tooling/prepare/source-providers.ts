import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { RepositoryContext } from '../context.js';
import type { FileUpdate } from './files.js';

interface SourcePin {
	variable: string;
	description: string;
	resolve: () => Promise<string>;
	archiveShaVariable?: string;
	archiveUrl?: ( commit: string ) => string;
}

type SourceDefinition = ( contents: string ) => SourcePin[];

function githubHeaders(): Record<string, string> {
	const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
	return {
		Accept: 'application/vnd.github+json',
		...( token ? { Authorization: `Bearer ${ token }` } : {} ),
		'X-GitHub-Api-Version': '2022-11-28'
	};
}

async function request(
	url: string,
	headers: Record<string, string> = {}
): Promise<Response> {
	const response = await fetch( url, {
		headers,
		signal: AbortSignal.timeout( 30000 )
	} );
	if ( !response.ok ) {
		throw new Error( `${ url } returned HTTP ${ response.status }.` );
	}
	return response;
}

async function githubCommit(
	repository: string,
	branch: string
): Promise<string> {
	const response = await request(
		`https://api.github.com/repos/${ repository }/commits/${ branch }`,
		githubHeaders()
	);
	return ( ( await response.json() ) as { sha: string } ).sha;
}

async function gerritCommit(
	repository: string,
	branch: string
): Promise<string> {
	const url = `https://gerrit.wikimedia.org/r/plugins/gitiles/${ repository }/+/refs/heads/${ branch }?format=JSON`;
	const response = await request( url );
	const body = ( await response.text() ).replace( /^\)\]\}'\n/u, '' );
	return ( JSON.parse( body ) as { commit: string } ).commit;
}

async function codebergCommit(
	repository: string,
	branch: string
): Promise<string> {
	const response = await request(
		`https://codeberg.org/api/v1/repos/${ repository }/branches/${ branch }`
	);
	return ( ( await response.json() ) as { commit: { id: string } } ).commit.id;
}

async function archiveSha256( url: string ): Promise<string> {
	const response = await request( url );
	return createHash( 'sha256' )
		.update( Buffer.from( await response.arrayBuffer() ) )
		.digest( 'hex' );
}

function escapeRegExp( value: string ): string {
	return value.replace( /[.*+?^${}()|[\]\\]/gu, '\\$&' );
}

function readVariable( contents: string, variable: string ): string {
	const match = new RegExp( `^${ escapeRegExp( variable ) }=(.+)$`, 'mu' ).exec(
		contents
	);
	if ( !match ) {
		throw new Error( `Could not find ${ variable } in build.env.` );
	}
	return match[ 1 ];
}

export function replaceVariable(
	contents: string,
	variable: string,
	value: string
): string {
	const pattern = new RegExp( `^${ escapeRegExp( variable ) }=[^\n]+$`, 'mu' );
	if ( !pattern.test( contents ) ) {
		throw new Error( `Could not find ${ variable } in build.env.` );
	}
	return contents.replace( pattern, `${ variable }=${ value }` );
}

const WIKIMEDIA_EXTENSIONS = [
	[ 'WIKIBASE_COMMIT', 'Wikibase' ],
	[ 'BABEL_COMMIT', 'Babel' ],
	[ 'CLDR_COMMIT', 'cldr' ],
	[ 'CIRRUSSEARCH_COMMIT', 'CirrusSearch' ],
	[ 'ELASTICA_COMMIT', 'Elastica' ],
	[ 'ECHO_COMMIT', 'Echo' ],
	[ 'ENTITYSCHEMA_COMMIT', 'EntitySchema' ],
	[ 'OAUTH_COMMIT', 'OAuth' ],
	[ 'PLUGGABLEAUTH_COMMIT', 'PluggableAuth' ],
	[ 'UNIVERSALLANGUAGESELECTOR_COMMIT', 'UniversalLanguageSelector' ],
	[ 'WIKIBASECIRRUSSEARCH_COMMIT', 'WikibaseCirrusSearch' ],
	[ 'WIKIBASEMANIFEST_COMMIT', 'WikibaseManifest' ],
	[ 'WSOAUTH_COMMIT', 'WSOAuth' ]
] as const;

const DEFINITIONS: Record<string, SourceDefinition> = {
	wikibase: ( contents ) => {
		const mediaWikiVersion = readVariable( contents, 'MEDIAWIKI_VERSION' );
		const match = /^(\d+)\.(\d+)/u.exec( mediaWikiVersion );
		if ( !match ) {
			throw new Error( `Invalid MEDIAWIKI_VERSION "${ mediaWikiVersion }".` );
		}
		const branch = `REL${ match[ 1 ] }_${ match[ 2 ] }`;
		return [
			...WIKIMEDIA_EXTENSIONS.map( ( [ variable, extension ] ) => ( {
				variable,
				description: `${ extension } ${ branch }`,
				resolve: async () =>
					await gerritCommit( `mediawiki/extensions/${ extension }`, branch )
			} ) ),
			{
				variable: 'WIKIBASELOCALMEDIA_COMMIT',
				description: 'ProfessionalWiki/WikibaseLocalMedia master',
				resolve: async () =>
					await githubCommit( 'ProfessionalWiki/WikibaseLocalMedia', 'master' )
			},
			{
				variable: 'WIKIBASEEDTF_COMMIT',
				description: 'ProfessionalWiki/WikibaseEdtf master',
				resolve: async () =>
					await githubCommit( 'ProfessionalWiki/WikibaseEdtf', 'master' )
			},
			{
				variable: 'WIKIBASEINWIKITEXT_COMMIT',
				description: 'wbstack/mediawiki-extensions-WikibaseInWikitext main',
				resolve: async () =>
					await githubCommit(
						'wbstack/mediawiki-extensions-WikibaseInWikitext',
						'main'
					)
			}
		];
	},
	quickstatements: () => [
		{
			variable: 'QUICKSTATEMENTS_COMMIT',
			description: 'magnusmanske/quickstatements master',
			resolve: async () =>
				await githubCommit( 'magnusmanske/quickstatements', 'master' )
		},
		{
			variable: 'MAGNUSTOOLS_COMMIT',
			description: 'magnusmanske/magnustools master',
			resolve: async () =>
				await codebergCommit( 'magnusmanske/magnustools', 'master' ),
			archiveShaVariable: 'MAGNUSTOOLS_ARCHIVE_SHA',
			archiveUrl: ( commit ) =>
				`https://codeberg.org/magnusmanske/magnustools/archive/${ commit }.tar.gz`
		}
	],
	'wdqs-frontend': () => [
		{
			variable: 'WDQSQUERYGUI_COMMIT',
			description: 'wikidata/query/gui master',
			resolve: async () => await gerritCommit( 'wikidata/query/gui', 'master' )
		}
	]
};

export const sourceUpdateImages = Object.keys( DEFINITIONS ).sort();

export async function planSourceUpdate(
	context: RepositoryContext,
	image: string
): Promise<FileUpdate> {
	const path = join( context.imagesRoot, image, 'build.env' );
	const original = readFileSync( path, 'utf8' );
	let contents = original;

	console.log( `Checking ${ image } upstream sources:` );
	for ( const pin of DEFINITIONS[ image ]( original ) ) {
		const previous = readVariable( contents, pin.variable );
		const commit = await pin.resolve();
		if ( previous === commit ) {
			console.log( `  ${ pin.variable }: current (${ commit })` );
			continue;
		}
		console.log( `  ${ pin.variable }: ${ previous } -> ${ commit }` );
		console.log( `    ${ pin.description }` );
		contents = replaceVariable( contents, pin.variable, commit );
		if ( pin.archiveShaVariable && pin.archiveUrl ) {
			const checksum = await archiveSha256( pin.archiveUrl( commit ) );
			contents = replaceVariable( contents, pin.archiveShaVariable, checksum );
		}
	}
	if ( contents === original ) {
		console.log( `  No ${ image } source pin updates are available.` );
	}
	return { path, contents };
}
