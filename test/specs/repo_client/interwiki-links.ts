import { readFile } from 'fs/promises';
import assert from 'assert';
import { utf8 } from '../../helpers/readFileEncoding.js';

describe( 'Interwiki links', function () {
	it( 'Should be able to insert interwiki links', async () => {
		// eslint-disable-next-line security/detect-non-literal-fs-filename
		const repoLinkFile = await readFile(
			new URL( 'interwiki-link.sql', import.meta.url ),
			utf8
		);
		const repoLink = repoLinkFile
			.toString()
			.replace( /<WIKI_ID>/g, 'client_wiki' )
			.replace( /<HOSTNAME>/g, globalThis.env.WIKIBASE_CLIENT_URL );
		await browser.dbQuery( repoLink );
		const clientWikiQueryResults = await browser.dbQuery(
			'SELECT iw_url FROM interwiki WHERE iw_prefix = "client_wiki"'
		);
		assert( clientWikiQueryResults.includes( globalThis.env.WIKIBASE_CLIENT_URL ) );

		const config = {
			user: globalThis.env.DB_USER,
			pass: globalThis.env.DB_PASS,
			database: 'client_wiki'
		};
		const clientLink = repoLinkFile
			.toString()
			.replace( /<WIKI_ID>/g, 'my_wiki' )
			.replace( /<HOSTNAME>/g, globalThis.env.WIKIBASE_URL );

		await browser.dbQuery( clientLink, config );
		const myWikiQueryResults = await browser.dbQuery(
			'SELECT iw_url FROM interwiki WHERE iw_prefix = "my_wiki"',
			config
		);
		assert( myWikiQueryResults.includes( globalThis.env.WIKIBASE_URL ) );
	} );
} );
