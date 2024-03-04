/*
NOTE: The upgrade test suite doesn't include WDQS/QueryService nor test its upgrade
for unknown reasons. This spec existed but was skipped in the code the Wikibase Suite
team inherited.
*/

import { getElementByURI } from '../../helpers/blazegraph.js';
import ItemPage from '../../helpers/pages/entity/item.page.js';
import SpecialEntityDataPage from '../../helpers/pages/special/entity-data.page.js';
import Binding from '../../types/binding.js';

describe( 'Wikibase post upgrade', function () {
	let oldItemID: string;
	let oldPropertyID: string;

	beforeEach( function () {
		if ( testEnv.vars.RUN_QUERYSERVICE_POST_UPGRADE_TEST !== 'true' ) {
			this.skip();
		}
	} );

	it( 'Should be able find the item after upgrade', async function () {
		const result = await browser.makeRequest(
			`${ testEnv.vars.WIKIBASE_URL }/w/api.php?action=wbsearchentities&search=UpgradeItem&format=json&language=en&type=item`
		);
		const success = result.data.success;
		const searchResults = result.data.search;

		expect( success ).toBe( 1 );
		expect( searchResults ).toHaveLength( 1 );
		expect( searchResults[ 0 ].match.text ).toBe( 'UpgradeItem' );
		expect( searchResults[ 0 ].match.type ).toBe( 'label' );

		oldItemID = searchResults[ 0 ].id;

		await ItemPage.open( oldItemID );
	} );

	it( 'Should show up in Special:EntityData with json', async function () {
		const data = await SpecialEntityDataPage.getData( oldItemID );
		const properties = Object.keys( data.entities[ oldItemID ].claims );

		expect( properties ).toHaveLength( 1 );

		oldPropertyID = properties[ 0 ];
	} );

	it( 'Should show up in the Queryservice', async function () {
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

		expect( bindings ).toHaveLength( 9 );

		const statement = getElementByURI(
			`${ testEnv.vars.WIKIBASE_URL }/prop/${ oldPropertyID }`,
			bindings
		);
		const property = getElementByURI(
			`${ testEnv.vars.WIKIBASE_URL }/prop/direct/${ oldPropertyID }`,
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

		expect( dateModified ).toEqual( expect.anything() );
		expect( schemaVersion ).toEqual( expect.anything() );
		expect( siteLinks ).toEqual( expect.anything() );
		expect( identifiers ).toEqual( expect.anything() );
		expect( timestamp ).toEqual( expect.anything() );
		expect( statement ).toEqual( expect.anything() );

		expect( property ).toEqual( expect.anything() );
		expect( property.o.value ).toBe( 'UpgradeItemStringValue' );

		expect( itemLabelValue ).toEqual( expect.anything() );
		expect( itemLabelValue.o.value ).toBe( 'UpgradeItem' );
	} );
} );
