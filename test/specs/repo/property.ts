import assert from 'assert';
import WikibaseApi from 'wdio-wikibase/wikibase.api.js';
import Property from '../../helpers/pages/entity/property.page.js';

describe( 'Property', function () {
	let propertyId: string = null;

	it( 'Should be able to add statement and reference to property', async () => {
		propertyId = await WikibaseApi.getProperty( 'string' );

		const propertyIdSelector = `=${propertyId} (${propertyId})`; // =P1 (P1)

		await Property.open( propertyId );
		await Property.addStatement.click();

		// fill out property id for statement
		await browser.keys( propertyId.split( '' ) );
		await $( propertyIdSelector ).click();
		await browser.keys( [ 'S', 'T', 'A', 'T', 'E', 'M', 'E', 'N', 'T' ] );

		// wait for save button to re-enable
		// eslint-disable-next-line wdio/no-pause
		await browser.pause( 1000 * 1 );
		await Property.save.click();
		// eslint-disable-next-line wdio/no-pause
		await browser.pause( 1000 * 2 );

		await Property.addReference.click();

		// fill out property id for reference
		await $( '.ui-entityselector-input' );
		// eslint-disable-next-line wdio/no-pause
		await browser.pause( 1000 * 1 );
		await browser.keys( propertyId.split( '' ) );
		// await $( propertyIdSelector ).click();
		await $( propertyIdSelector ).click();
		await browser.keys( [ 'R', 'E', 'F', 'E', 'R', 'E', 'N', 'C', 'E' ] );

		// eslint-disable-next-line wdio/no-pause
		await browser.pause( 1000 * 1 );
		await Property.save.click();

		await Property.open( propertyId );
	} );

	it( 'Should contain statement and reference in EntityData', async () => {
		const response = await browser.makeRequest(
			`${globalThis.env.WIKIBASE_URL}/wiki/Special:EntityData/${propertyId}.json`
		);
		const body = response.data;
		const claim = body.entities[ propertyId ].claims[ propertyId ][ 0 ];
		const reference = claim.references[ 0 ].snaks[ propertyId ][ 0 ];

		assert.strictEqual( claim.mainsnak.datavalue.value, 'STATEMENT' );
		assert.strictEqual( reference.datavalue.value, 'REFERENCE' );
	} );
} );
