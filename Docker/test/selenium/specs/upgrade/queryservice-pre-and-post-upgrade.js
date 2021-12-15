'use strict';

const assert = require( 'assert' );
const { getElementByURI } = require( '../../helpers/blazegraph' );

describe( 'Wikibase post upgrade', function () {

	let oldItemID;

	before( function () {
		if ( process.env.RUN_QUERYSERVICE_POST_UPGRADE_TEST !== 'true' ) {
			this.skip();
		}
	} );

	it( 'Should be able find the item after upgrade', function () {

		const result = browser.makeRequest(
			process.env.MW_SERVER + '/w/api.php?action=wbsearchentities&search=UpgradeItem&format=json&language=en&type=item'
		);
		const success = result.data.success;
		const searchResults = result.data.search;

		assert( success === 1 );
		assert( searchResults.length === 1 );
		assert( searchResults[ 0 ].match.text === 'UpgradeItem' );
		assert( searchResults[ 0 ].match.type === 'label' );

		oldItemID = searchResults[ 0 ].id;

		browser.url( process.env.MW_SERVER + '/wiki/Item:' + oldItemID );

	} );

	it( 'Old item should show up in Queryservice', function () {

		browser.pause( 15 * 1000 );

		const bindings = browser.queryBlazeGraphItem( oldItemID );

		assert( bindings.length === 9 );

		const statement = getElementByURI( process.env.MW_SERVER + '/prop/P101', bindings );
		const property = getElementByURI( process.env.MW_SERVER + '/prop/direct/P101', bindings );

		const itemLabelValue = getElementByURI( 'http://www.w3.org/2000/01/rdf-schema#label', bindings );

		const dateModified = getElementByURI( 'http://schema.org/dateModified', bindings );
		const schemaVersion = getElementByURI( 'http://schema.org/version', bindings );
		const siteLinks = getElementByURI( 'http://wikiba.se/ontology#sitelinks', bindings );
		const identifiers = getElementByURI( 'http://wikiba.se/ontology#identifiers', bindings );
		const timestamp = getElementByURI( 'http://wikiba.se/ontology#timestamp', bindings );

		assert( dateModified !== null );
		assert( schemaVersion !== null );
		assert( siteLinks !== null );
		assert( identifiers !== null );
		assert( timestamp !== null );
		assert( statement !== null );

		assert( property.o.value === 'UpgradeItemStringValue' );
		assert( itemLabelValue.o.value === 'UpgradeItem' );

	} );

} );
