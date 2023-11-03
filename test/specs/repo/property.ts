import assert from 'assert';
import Property from '../../helpers/pages/entity/property.page.js';
import WikibaseApi from 'wdio-wikibase/wikibase.api.js';
import awaitDisplayed from '../../helpers/await-displayed.js';

describe( 'Property', function () {
	let propertyId: string = null;

	it( 'Should be able to add statement and reference to property', async () => {
		propertyId = await WikibaseApi.getProperty( 'string' );

		const propertyIdSelector = `=${propertyId} (${propertyId})`; // =P1 (P1)

		await Property.open( propertyId );
		const addStatementEl = await awaitDisplayed( Property.addStatement );
		await addStatementEl.click();

		// fill out property id for statement
		await browser.keys( propertyId.split( '' ) );
		const propertyIdEl = await awaitDisplayed( propertyIdSelector );
		await propertyIdEl.click();
		await browser.keys( [ 'S', 'T', 'A', 'T', 'E', 'M', 'E', 'N', 'T' ] );

		// wait for save button to re-enable
		await browser.pause( 1000 * 1 );
		const saveEl = await Property.save;
		await saveEl.click();
		await browser.pause( 1000 * 2 );

		const referenceEl = await awaitDisplayed( Property.addReference );
		await referenceEl.click();

		// fill out property id for reference
		await awaitDisplayed( '.ui-entityselector-input' );
		await browser.pause( 1000 * 1 );
		await browser.keys( propertyId.split( '' ) );
		// await $( propertyIdSelector ).click();
		await propertyIdEl.waitForDisplayed();
		await propertyIdEl.click();
		await browser.keys( [ 'R', 'E', 'F', 'E', 'R', 'E', 'N', 'C', 'E' ] );

		await browser.pause( 1000 * 1 );
		await saveEl.click();

		await Property.open( propertyId );
	} );

	it( 'Should contain statement and reference in EntityData', async () => {
		const response = await browser.makeRequest(
			`${process.env.MW_SERVER}/wiki/Special:EntityData/${propertyId}.json`
		);
		const body = response.data;
		const claim = body.entities[ propertyId ].claims[ propertyId ][ 0 ];
		const reference = claim.references[ 0 ].snaks[ propertyId ][ 0 ];

		assert.strictEqual( claim.mainsnak.datavalue.value, 'STATEMENT' );
		assert.strictEqual( reference.datavalue.value, 'REFERENCE' );
	} );
} );
