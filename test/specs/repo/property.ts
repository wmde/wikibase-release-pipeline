import assert from 'assert';
import WikibaseApi from 'wdio-wikibase/wikibase.api.js';
import Property from '../../helpers/pages/entity/property.page.js';
import {
	Claim,
	Reference,
	SpecialEntityData
} from '../../helpers/types/request-response.js';
import WikibasePropertyType from '../../helpers/types/wikibase-property-type.js';
import {
	wikibasePropertyItem,
	wikibasePropertyString
} from '../../helpers/wikibase-property-types.js';

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
			} );

			beforeEach( async () => {
				await Property.open( propertyId );
			} );

			it( 'Should be able to add statement to property', async () => {
				await Property.addStatement.click();

				// fill out property id for statement
				await browser.keys( stringPropertyId.split( '' ) );
				await $( propertyIdSelector( stringPropertyId ) ).click();
				await browser.keys( 'STATEMENT'.split( '' ) );

				// wait for save button to re-enable
				await browser.waitForJobs();
				await Property.save.click();
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
				await $( '.ui-entityselector-input' );

				// eslint-disable-next-line wdio/no-pause
				await browser.pause( 1000 * 1 );
				await browser.keys( stringPropertyId.split( '' ) );
				await $( propertyIdSelector( stringPropertyId ) ).click();
				await browser.keys( 'REFERENCE'.split( '' ) );

				await browser.waitForJobs();
				await Property.save.click();
			} );

			it( 'Should be able to see added reference', async () => {
				await $( '=1 reference' ).click();
				await $( '=REFERENCE' );
			} );

			it( 'Should contain statement and reference in EntityData', async () => {
				const response = await browser.makeRequest(
					`${process.env.MW_SERVER}/wiki/Special:EntityData/${propertyId}.json`
				);
				const body: SpecialEntityData = response.data;
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
