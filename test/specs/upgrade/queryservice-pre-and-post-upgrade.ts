/*
NOTE: The upgrade test suite doesn't include WDQS/QueryService nor test its upgrade
for unknown reasons. This spec existed but was skipped in the code the Wikibase Suite
team inherited.
*/

import assert from 'assert';
import { getElementByURI } from '../../helpers/blazegraph.js';
import ItemPage from '../../helpers/pages/entity/item.page.js';
import Binding from '../../types/binding.js';

describe( 'Wikibase post upgrade', function () {
	let oldItemID: string;
	let oldPropertyID: string;

	beforeEach( function () {
		if ( testEnv.vars.RUN_QUERYSERVICE_POST_UPGRADE_TEST !== 'true' ) {
			this.skip();
		}
	} );

	it( 'Should be able find the item after upgrade', async () => {
		const result = await browser.makeRequest(
			`${testEnv.vars.WIKIBASE_URL}/w/api.php?action=wbsearchentities&search=UpgradeItem&format=json&language=en&type=item`
		);
		const success = result.data.success;
		const searchResults = result.data.search;

		assert.strictEqual( success, 1 );
		assert.strictEqual( searchResults.length, 1 );
		assert.strictEqual( searchResults[ 0 ].match.text, 'UpgradeItem' );
		assert.strictEqual( searchResults[ 0 ].match.type, 'label' );

		oldItemID = searchResults[ 0 ].id;

		await ItemPage.open( oldItemID );
	} );

	it( 'Should show up in Special:EntityData with json', async () => {
		const response = await browser.makeRequest(
			`${testEnv.vars.WIKIBASE_URL}/wiki/Special:EntityData/${oldItemID}.json`
		);

		const body = response.data;
		const properties = Object.keys( body.entities[ oldItemID ].claims );

		assert.strictEqual( properties.length, 1 );

		oldPropertyID = properties[ 0 ];
	} );

	it( 'Should show up in the Queryservice', async () => {
		let bindings: Binding[];

		await browser.waitUntil(
			async () => {
				bindings = await browser.queryBlazeGraphItem( oldItemID );

				return bindings.length === 9;
			},
			{
				timeout: 15000,
				timeoutMsg: 'Blazegraph should have updated the item by now'
			}
		);

		assert.strictEqual( bindings.length, 9 );

		const statement = getElementByURI(
			testEnv.vars.WIKIBASE_URL + '/prop/' + oldPropertyID,
			bindings
		);
		const property = getElementByURI(
			testEnv.vars.WIKIBASE_URL + '/prop/direct/' + oldPropertyID,
			bindings
		);

		const itemLabelValue = getElementByURI(
			'http://www.w3.org/2000/01/rdf-schema#label',
			bindings
		);

		const dateModified = getElementByURI(
			'http://schema.org/dateModified',
			bindings
		);
		const schemaVersion = getElementByURI(
			'http://schema.org/version',
			bindings
		);
		const siteLinks = getElementByURI(
			'http://wikiba.se/ontology#sitelinks',
			bindings
		);
		const identifiers = getElementByURI(
			'http://wikiba.se/ontology#identifiers',
			bindings
		);
		const timestamp = getElementByURI(
			'http://wikiba.se/ontology#timestamp',
			bindings
		);

		assert( dateModified !== null );
		assert( schemaVersion !== null );
		assert( siteLinks !== null );
		assert( identifiers !== null );
		assert( timestamp !== null );
		assert( statement !== null );

		assert( property !== null );
		assert.strictEqual( property.o.value, 'UpgradeItemStringValue' );

		assert( itemLabelValue !== null );
		assert.strictEqual( itemLabelValue.o.value, 'UpgradeItem' );
	} );
} );
