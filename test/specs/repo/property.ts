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

describe( 'Property', function () {
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

			it( 'Should be able to add statement to property', async () => {
				await Property.addStatementLink.click();
				// fill out property id for statement
				await browser.keys( stringPropertyId.split( '' ) );
				await $( propertyIdSelector( stringPropertyId ) ).click();
				await browser.keys( 'STATEMENT'.split( '' ) );
				// wait for save button to re-enable
				await Property.saveStatementLink.click();
			} );

			it( 'Should be able to see added statement', async () => {
				this.retries( 4 );

				await expect( $( 'div=STATEMENT' ) ).toExist();
				await expect( $( `aria/Property:${stringPropertyId}` ) ).toHaveText( stringPropertyId );
			} );

			it( 'Should be able to add reference to property', async () => {
				await Property.addReferenceLink.click();
				// fill out property id for reference
				await $( '.ui-entityselector-input' ).isFocused();
				await browser.keys( stringPropertyId.split( '' ) );
				await $( propertyIdSelector( stringPropertyId ) ).click();
				await browser.keys( 'REFERENCE'.split( '' ) );
				await Property.saveStatementLink.click();
			} );

			it( 'Should be able to see added reference', async function () {
				this.retries( 4 );

				await $( '=1 reference' ).click();
				await expect( $( 'div=REFERENCE' ) ).toExist();
			} );

			it( 'Should contain statement and reference in EntityData', async function () {
				this.retries( 4 );

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

			it( 'Should show changes in "View history" tab', async () => {
				await $( '=View history' ).click();
				await expect( $( '.comment*=Created claim' ) ).toExist();
				await expect( $( '.comment*=Changed claim' ) ).toExist();
				await expect( $( '.comment*=Created a new Property' ) ).toExist();
			} );

			it( 'Should display the added properties on the "Recent changes" page', async () => {
				await browser.waitForJobs();
				await $( '=Recent changes' ).click();
				await expect( $( `=(${propertyId})` ) ).toExist();
				await expect( $( `=(${stringPropertyId})` ) ).toExist();
			} );
		} );
	} );
} );
