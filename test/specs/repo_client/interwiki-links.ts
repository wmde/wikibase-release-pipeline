import { readFile } from 'fs/promises';
import { utf8 } from '../../helpers/read-file-encoding.js';

describe( 'Interwiki links', function () {
	it( 'Should be able to insert interwiki links', async function () {
		// eslint-disable-next-line security/detect-non-literal-fs-filename
		const repoLinkFile = await readFile(
			new URL( 'interwiki-link.sql', import.meta.url ),
			utf8
		);
		const repoLink = repoLinkFile
			.toString()
			.replace( /<WIKI_ID>/g, 'client_wiki' )
			.replace( /<HOSTNAME>/g, testEnv.vars.WIKIBASE_CLIENT_URL );
		await browser.dbQuery( repoLink );
		const clientWikiQueryResults = await browser.dbQuery(
			'SELECT iw_url FROM interwiki WHERE iw_prefix = "client_wiki"'
		);
		expect(
			clientWikiQueryResults.includes( testEnv.vars.WIKIBASE_CLIENT_URL )
		).toBe( true );

		const config = {
			user: testEnv.vars.DB_USER,
			pass: testEnv.vars.DB_PASS,
			database: 'client_wiki'
		};
		const clientLink = repoLinkFile
			.toString()
			.replace( /<WIKI_ID>/g, 'my_wiki' )
			.replace( /<HOSTNAME>/g, testEnv.vars.WIKIBASE_URL );

		await browser.dbQuery( clientLink, config );
		const myWikiQueryResults = await browser.dbQuery(
			'SELECT iw_url FROM interwiki WHERE iw_prefix = "my_wiki"',
			config
		);
		expect( myWikiQueryResults.includes( testEnv.vars.WIKIBASE_URL ) ).toBe( true );
	} );
} );
