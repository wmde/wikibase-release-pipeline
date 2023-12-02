import { readFile } from 'fs/promises';
import { skipIfExtensionNotPresent } from '../../../helpers/default-functions.js';
import { utf8 } from '../../../helpers/readFileEncoding.js';

describe( 'SyntaxHighlight', function () {
	beforeEach( async function () {
		await skipIfExtensionNotPresent( this, 'Scribunto' );
		await skipIfExtensionNotPresent( this, 'SyntaxHighlight' );
	} );

	it( 'Should highlight lua script', async () => {
		// eslint-disable-next-line security/detect-non-literal-fs-filename
		const fileContents = await readFile( new URL( 'bananas.lua', import.meta.url ), utf8 );

		await browser.editPage(
			globalThis.env.MW_SERVER,
			'Module:Olives',
			fileContents
		);

		await browser.url( globalThis.env.MW_SERVER + '/wiki/Module:Olives' );

		// should come with highlighted lua script
		await $( '.mw-highlight' );
	} );
} );
