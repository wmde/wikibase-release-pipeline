/*
NOTE: The upgrade test suite doesn't include WDQS/QueryService nor test its upgrade
for unknown reasons. This spec existed but was skipped in the code the Wikibase Suite
team inherited.
*/

import WikibaseApi from 'wdio-wikibase/wikibase.api.js';
import { getElementByURI } from '../../helpers/blazegraph.js';
import Binding from '../../types/binding.js';

describe( 'Wikibase post upgrade', function () {
	const itemLabel = 'NewUpgradeItem';
	const propertyValue = 'NewUpgradeItemStringValue';
	let newItemId: string;
	let newPropertyId: string;

	beforeEach( function () {
		if ( testEnv.vars.RUN_QUERYSERVICE_POST_UPGRADE_TEST !== 'true' ) {
			this.skip();
		}
	} );

	it( 'Should be able to create a new specific item', async function () {
		newPropertyId = await WikibaseApi.createProperty( 'string' );
		const data = {
			claims: [
				{
					mainsnak: {
						snaktype: 'value',
						property: newPropertyId,
						datavalue: { value: propertyValue, type: 'string' }
					},
					type: 'statement',
					rank: 'normal'
				}
			]
		};

		newItemId = await WikibaseApi.createItem( itemLabel, data );

		expect( newItemId ).toMatch( /^Q\d+$/ );
		expect( newPropertyId ).toMatch( /^P\d+$/ );
	} );

	it( 'New item should show up in Queryservice', async function () {
		let bindings: Binding[];

		await browser.waitUntil(
			async () => {
				bindings = await browser.queryBlazeGraphItem( newItemId );
				return bindings.length === 9;
			},
			{
				timeout: 15000,
				timeoutMsg: 'Blazegraph should have updated the item by now'
			}
		);

		expect( bindings ).toHaveLength( 9 );

		const statement = getElementByURI(
			testEnv.vars.WIKIBASE_URL + '/prop/' + newPropertyId,
			bindings
		);
		const property = getElementByURI(
			testEnv.vars.WIKIBASE_URL + '/prop/direct/' + newPropertyId,
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

		expect( property.o.value ).toEqual( propertyValue );
		expect( itemLabelValue.o.value ).toEqual( itemLabel );
	} );
} );
