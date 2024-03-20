import { readFile } from 'fs/promises';
import page from '../../../helpers/pages/page.js';
import { utf8 } from '../../../helpers/read-file-encoding.js';

describe( 'SyntaxHighlight', function () {
	beforeEach( async function () {
		await browser.skipIfExtensionNotPresent( this, 'Scribunto' );
		await browser.skipIfExtensionNotPresent( this, 'SyntaxHighlight' );
	} );

	it( 'Should highlight lua script', async function () {
		// eslint-disable-next-line security/detect-non-literal-fs-filename
		const fileContents = await readFile(
			new URL( 'bananas.lua', import.meta.url ),
			utf8
		);

		await browser.editPage(
			testEnv.vars.WIKIBASE_URL,
			'Module:Olives',
			fileContents
		);

		await page.open( '/wiki/Module:Olives' );

		// should come with highlighted lua script
		await $( '.mw-highlight' );
	} );
} );
