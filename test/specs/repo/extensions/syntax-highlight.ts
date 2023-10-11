import { readFile } from 'fs/promises';
import { skipIfExtensionNotPresent } from '../../../helpers/default-functions.js';
import { utf8 } from '../../../helpers/readFileEncoding.js';

describe( 'SyntaxHighlight', function () {
	beforeEach( async function () {
		await skipIfExtensionNotPresent( this, 'Scribunto' );
		await skipIfExtensionNotPresent( this, 'SyntaxHighlight' );
	} );

	it( 'Should highlight lua script', async () => {
		const fileContents = await readFile( new URL( 'bananas.lua', import.meta.url ), utf8 );

		await browser.editPage(
			process.env.MW_SERVER,
			'Module:Olives',
			fileContents
		);

		await browser.url( process.env.MW_SERVER + '/wiki/Module:Olives' );

		// should come with highlighted lua script
		const highlightEl = await $( '.mw-highlight' );
		await highlightEl.waitForDisplayed();
	} );
} );
