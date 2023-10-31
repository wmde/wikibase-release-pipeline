import assert from 'assert';
import { skipIfExtensionNotPresent } from '../../helpers/default-functions.js';
import awaitDisplayed from '../../helpers/await-displayed.js';

describe( 'Special:Version', function () {
	it( 'Should contain the correct MediaWiki version', async function () {
		const prerelease = process.env.WIKIBASE_SUITE_RELEASE_PRERELEASE_VERSION;
		if ( prerelease && prerelease.length ) {
			this.skip();
		}

		await browser.url( `${process.env.MW_SERVER}/wiki/Special:Version` );
		const softwareEl = await awaitDisplayed( '#sv-software' );
		const text = await softwareEl.getText();
		assert.strictEqual(
			text.includes( `MediaWiki\t${process.env.MEDIAWIKI_VERSION}` ),
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

			it( `Should contain ${name} extensions`, async function () {
				await skipIfExtensionNotPresent( this, name );

				await browser.url( `${process.env.MW_SERVER}/wiki/Special:Version` );

				// /wiki/Special:Version generate these for each installed extension
				const elementSelector = await awaitDisplayed(
					`#mw-version-ext-${extensionPackage}-${extension.replace( / /g, '_' )}`
				);
				await elementSelector.scrollIntoView();

				assert( elementSelector.getText() !== null );
			} );
		} );
	} );
} );
