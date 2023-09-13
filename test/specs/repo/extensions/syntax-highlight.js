import { readFile } from 'fs/promises';
import { skipIfExtensionNotPresent } from '../../../helpers/default-functions';
import { utf8 } from '../../../helpers/readFileEncoding';

describe( 'SyntaxHighlight', function () {
	it( 'Should highlight lua script', async () => {
		skipIfExtensionNotPresent( this, 'Scribunto' );
		skipIfExtensionNotPresent( this, 'SyntaxHighlight' );

		const fileContents = await readFile( __dirname + '/bananas.lua', utf8 );

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
