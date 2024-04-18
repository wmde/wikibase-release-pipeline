import page from '../../helpers/pages/page.js';

describe( 'Special:Version', function () {
	it( 'Should contain the correct MediaWiki version', async function () {
		await page.open( '/wiki/Special:Version' );
		await expect( $( '#sv-software' ) ).toHaveText(
			// eslint-disable-next-line security/detect-non-literal-regexp
			new RegExp( `MediaWiki ${ testEnv.vars.MEDIAWIKI_VERSION }` )
		);
	} );

	const extensions = {
		wikibase: [
			'EntitySchema',
			'WikibaseCirrusSearch',
			'WikibaseClient',
			'Wikibase Local Media',
			'WikibaseRepository',
			'WikibaseManifest'
		],
		other: [
			'CLDR',
			'CirrusSearch',
			'Elastica',
			'OAuth',
			'Parsoid',
			'UniversalLanguageSelector'
		],
		parserhook: [ 'Babel', 'Scribunto' ],
		editor: [ 'VisualEditor' ],
		antispam: [ 'ConfirmEdit' ],
		specialpage: [ 'Nuke' ]
	};

	// should be disabled for dynamic tests
	// eslint-disable-next-line mocha/no-setup-in-describe
	Object.keys( extensions ).forEach( ( extensionPackage ) => {
		extensions[ extensionPackage ].forEach( ( extension: string ) => {
			// Get the extension name from the override if available
			const name = extension;

			it( `Should contain ${ name } extensions`, async function () {
				await browser.skipIfExtensionNotPresent( this, name );
				await page.open( '/wiki/Special:Version' );

				// /wiki/Special:Version generate these for each installed extension
				const elementSelector = await $(
					`#mw-version-ext-${ extensionPackage }-${ extension.replace( / /g, '_' ) }`
				);
				await elementSelector.scrollIntoView();

				await expect( elementSelector ).toHaveText( /.+/ );
			} );
		} );
	} );
} );
