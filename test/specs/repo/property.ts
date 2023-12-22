import assert from 'assert';
import WikibaseApi from 'wdio-wikibase/wikibase.api.js';
import Property from '../../helpers/pages/entity/property.page.js';
import {
	wikibasePropertyItem,
	wikibasePropertyString
} from '../../helpers/wikibase-property-types.js';
import { Claim, EntityData, Reference } from '../../types/entity-data.js';
import WikibasePropertyType from '../../types/wikibase-property-type.js';

const dataTypes = [ wikibasePropertyItem, wikibasePropertyString ];

const propertyIdSelector = ( id: string ): string => `=${id} (${id})`; // =P1 (P1)

describe( 'Property', () => {
	// eslint-disable-next-line mocha/no-setup-in-describe
	dataTypes.forEach( ( dataType: WikibasePropertyType ) => {
		// eslint-disable-next-line mocha/no-setup-in-describe
		describe( `Should be able to work with type ${dataType.name}`, () => {
			let propertyId: string = null;
			let stringPropertyId: string = null;

			before( async () => {
				propertyId = await WikibaseApi.createProperty( dataType.urlName );
				stringPropertyId = await WikibaseApi.createProperty(
					wikibasePropertyString.urlName
				);
				await browser.waitForJobs();
			} );

			beforeEach( async () => {
				await Property.open( propertyId );
			} );

			afterEach( async () => {
				// Extra pause to make sure AJAX requests complete before navigating away,
				// see: https://phabricator.wikimedia.org/T353520
				// eslint-disable-next-line wdio/no-pause
				await browser.pause( 2000 * 1 );
			} );

			it( 'Should be able to add statement to property', async () => {
				await Property.addStatement.click();
				// fill out property id for statement
				await browser.keys( stringPropertyId.split( '' ) );
				await $( propertyIdSelector( stringPropertyId ) ).click();
				await browser.keys( 'STATEMENT'.split( '' ) );
				// wait for save button to re-enable
				await Property.saveStatement.click();
			} );

			it( 'Should be able to see added statement', async () => {
				await $( '=STATEMENT' );
				const resultStatement = await $(
					`aria/Property:${stringPropertyId}`
				).getText();
				assert.equal( resultStatement, stringPropertyId );
			} );

			it( 'Should be able to add reference to property', async () => {
				await Property.addReference.click();
				// fill out property id for reference
				await $( '.ui-entityselector-input' ).isFocused();
				await browser.keys( stringPropertyId.split( '' ) );
				await $( propertyIdSelector( stringPropertyId ) ).click();
				await browser.keys( 'REFERENCE'.split( '' ) );
				await Property.saveStatement.click();
			} );

			it( 'Should be able to see added reference', async () => {
				await $( '=1 reference' ).click();
				await $( '=REFERENCE' );
			} );

			it( 'Should contain statement and reference in EntityData', async () => {
				const response = await browser.makeRequest(
					`${testEnv.vars.WIKIBASE_URL}/wiki/Special:EntityData/${propertyId}.json`
				);
				const body: EntityData = response.data;
				const claim: Claim =
					body.entities[ propertyId ].claims[ stringPropertyId ][ 0 ];
				const reference: Reference =
					claim.references[ 0 ].snaks[ stringPropertyId ][ 0 ];

				assert.strictEqual( claim.mainsnak.datavalue.value, 'STATEMENT' );
				assert.strictEqual( reference.datavalue.value, 'REFERENCE' );
			} );
		} );
	} );
} );
