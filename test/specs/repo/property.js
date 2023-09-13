import assert from 'assert';
import WikibaseApi from 'wdio-wikibase/wikibase.api';
import Property from '../../helpers/pages/entity/property.page';

describe( 'Property', function () {
	let propertyId = null;

	it( 'Should be able to add statement and reference to property', async () => {
		propertyId = await WikibaseApi.getProperty( 'string' );

		const propertyIdSelector = '=' + propertyId + ' (' + propertyId + ')'; // =P1 (P1)

		await Property.open( propertyId );
		const addStatementEl = await Property.addStatement;
		await addStatementEl.waitForDisplayed();
		await addStatementEl.click();

		// fill out property id for statement
		await browser.keys( propertyId.split( '' ) );
		const propertyIdEl = await $( propertyIdSelector );
		await propertyIdEl.waitForDisplayed();
		await propertyIdEl.click();
		await browser.keys( [ 'S', 'T', 'A', 'T', 'E', 'M', 'E', 'N', 'T' ] );

		// wait for save button to re-enable
		await browser.pause( 1000 * 1 );
		const saveEl = await Property.save;
		await saveEl.click();
		await browser.pause( 1000 * 2 );

		const referenceEl = await Property.addReference;
		await referenceEl.waitForDisplayed();
		await referenceEl.click();

		// fill out property id for reference
		const entitySelectorEl = await $( '.ui-entityselector-input' );
		await entitySelectorEl.waitForDisplayed();
		await browser.pause( 1000 * 1 );
		await browser.keys( propertyId.split( '' ) );
		// await $( propertyIdSelector ).waitForDisplayed();
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
			process.env.MW_SERVER +
			'/wiki/Special:EntityData/' +
			propertyId +
			'.json'
		);
		const body = response.data;
		const claim = body.entities[ propertyId ].claims[ propertyId ][ 0 ];
		const reference = claim.references[ 0 ].snaks[ propertyId ][ 0 ];

		assert.strictEqual( claim.mainsnak.datavalue.value, 'STATEMENT' );
		assert.strictEqual( reference.datavalue.value, 'REFERENCE' );
	} );
} );
