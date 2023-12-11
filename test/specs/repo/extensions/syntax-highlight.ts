import { readFile } from 'fs/promises';
import { utf8 } from '../../../helpers/readFileEncoding.js';
import envVars from '../../../setup/envVars.js';

describe( 'SyntaxHighlight', function () {
	beforeEach( async function () {
		await browser.skipIfExtensionNotPresent( this, 'Scribunto' );
		await browser.skipIfExtensionNotPresent( this, 'SyntaxHighlight' );
	} );

	it( 'Should highlight lua script', async () => {
		// eslint-disable-next-line security/detect-non-literal-fs-filename
		const fileContents = await readFile( new URL( 'bananas.lua', import.meta.url ), utf8 );

		await browser.editPage(
			envVars.WIKIBASE_URL,
			'Module:Olives',
			fileContents
		);

		await browser.url( envVars.WIKIBASE_URL + '/wiki/Module:Olives' );

		// should come with highlighted lua script
		await $( '.mw-highlight' );
	} );
} );
