'use strict';

const assert = require( 'assert' );
const defaultFunctions = require( '../../helpers/default-functions' );

describe( 'Special:Version', function () {
	it( 'Should contain the correct MediaWiki version', async function () {
		if ( process.env.WIKIBASE_SUITE_RELEASE_PRERELEASE_VERSION.match( /-pre\./ ) ) {
			this.skip();
		}

		await browser.url( process.env.MW_SERVER + '/wiki/Special:Version' );
		const softwareEl = await $( '#sv-software' );
		await softwareEl.waitForDisplayed();
		const text = await softwareEl.getText();
		assert.strictEqual(
			text.includes( 'MediaWiki\t' + process.env.MEDIAWIKI_VERSION ),
			true
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
		extensions[ extensionPackage ].forEach( ( extension ) => {
			// Get the extension name from the override if available
			const name = extension;

			it( 'Should contain ' + name + ' extensions', async function () {
				defaultFunctions.skipIfExtensionNotPresent( this, name );

				await browser.url( process.env.MW_SERVER + '/wiki/Special:Version' );

				// /wiki/Special:Version generate these for each installed extension
				const elementSelector = await $(
					'#mw-version-ext-' +
					extensionPackage +
					'-' +
					extension.replace( / /g, '_' )
				);
				await elementSelector.waitForDisplayed();
				await elementSelector.scrollIntoView();

				assert( elementSelector.getText() !== null );
			} );
		} );
	} );
} );
