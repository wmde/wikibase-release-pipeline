'use strict';

const assert = require( 'assert' );

describe( 'Special:Version', function () {

	const extensions = {
		wikibase: [
			'EntitySchema',
			'WikibaseCirrusSearch',
			'WikibaseClient',
			'Wikibase Local Media',
			'WikibaseRepository',
			'WikibaseManifest'
		],
		other: [ 'CLDR', 'CirrusSearch', 'Elastica', 'OAuth', 'Parsoid', 'UniversalLanguageSelector' ],
		parserhook: [ 'Scribunto' ],
		editor: [ 'VisualEditor' ],
		specialpage: [ 'Nuke' ]
	};

	// should be disabled for dynamic tests
	// eslint-disable-next-line mocha/no-setup-in-describe
	Object.keys( extensions ).forEach( ( extensionPackage ) => {

		it( 'Should contain ' + extensionPackage + ' extensions', function () {
			browser.url( process.env.MW_SERVER + '/wiki/Special:Version' );

			extensions[ extensionPackage ].forEach( ( extension ) => {

				// /wiki/Special:Version generate these for each installed extension
				const elementSelector = $( '#mw-version-ext-' + extensionPackage + '-' + extension.replace( / /g, '_' ) );
				elementSelector.waitForDisplayed();
				elementSelector.scrollIntoView();

				assert( elementSelector.getText() !== null );
			} );
		} );
	} );
} );
