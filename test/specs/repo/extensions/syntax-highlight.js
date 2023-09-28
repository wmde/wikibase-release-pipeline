import fsPromises from 'fs/promises';
import defaultFunctions from '../../../helpers/default-functions';
import { utf8 } from '../../../helpers/readFileEncoding.js';

describe( 'SyntaxHighlight', function () {
	it( 'Should highlight lua script', async () => {
		defaultFunctions.skipIfExtensionNotPresent( this, 'Scribunto' );
		defaultFunctions.skipIfExtensionNotPresent( this, 'SyntaxHighlight' );

		const fileContents = await fsPromises.readFile( new URL( 'bananas.lua', import.meta.url ), utf8 );

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
