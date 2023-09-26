import fsPromises from 'fs/promises';
import defaultFunctions from '../../../helpers/default-functions';
import readFileEncoding from '../../../helpers/readFileEncoding';

describe( 'SyntaxHighlight', function () {
	it( 'Should highlight lua script', async () => {
		defaultFunctions.skipIfExtensionNotPresent( this, 'Scribunto' );
		defaultFunctions.skipIfExtensionNotPresent( this, 'SyntaxHighlight' );

		const fileContents = await fsPromises.readFile(
			__dirname + '/bananas.lua',
			readFileEncoding.utf8
		);

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
