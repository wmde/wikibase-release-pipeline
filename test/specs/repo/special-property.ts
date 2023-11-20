import assert from 'assert';
import SpecialListProperties from '../../helpers/pages/special/list-properties.page.js';
import SpecialNewProperty from '../../helpers/pages/special/new-property.page.js';

const dataTypes = [
	// 'Commons media file',
	// 'EDTF Date/Time',
	// 'Entity Schema',
	// 'External identifier',
	// 'Geographic coordinates',
	// 'Geographic shape',
	'Item',
	// 'Media file',
	// 'Monolingual text',
	// 'Point in time',
	// 'Property',
	// 'Quantity',
	'String'
	// 'Tabular data',
	// 'URL'
];

describe( 'Special:NewProperty', function () {
	// eslint-disable-next-line mocha/no-setup-in-describe
	dataTypes.forEach( ( dataType: string ) => {
		it( `Should be able to create a new property of datatype ${dataType}`, async () => {
			await SpecialNewProperty.open();

			await SpecialNewProperty.labelInput.setValue( `Cool ${dataType} label` );
			await SpecialNewProperty.descriptionInput.setValue(
				`Cool ${dataType} description`
			);
			await SpecialNewProperty.aliasesInput.setValue(
				`Great ${dataType}!|Greatest ${dataType}!`
			);

			await SpecialNewProperty.datatypeInput.click();
			await $( 'oo-ui-menuSelectWidget' );
			await $( `.oo-ui-labelElement-label=${dataType}` ).click();

			await SpecialNewProperty.submit();

			const dataTypeText = await $(
				'.wikibase-propertyview-datatype-value'
			).getText();
			assert.strictEqual( dataTypeText, dataType );
		} );
	} );

	it( 'Should be able to see newly created properties in list of properties special page', async () => {
		await SpecialListProperties.openParams( { limit: 1000 } );
		const numberOfPropertiesBefore =
			await SpecialListProperties.properties.length;

		await SpecialNewProperty.open( 'string' );
		await SpecialNewProperty.labelInput.setValue( 'Property type string' );
		await SpecialNewProperty.descriptionInput.setValue( 'A string property' );
		await SpecialNewProperty.submit();

		// wait for the $wgWBRepoSettings['sharedCacheDuration'] cache to
		// timeout, so the list of properties reflects the change
		await browser.pause( 1100 );

		await SpecialListProperties.openParams( { limit: 1000 } );
		const numberOfPropertiesAfter =
			await SpecialListProperties.properties.length;

		assert.strictEqual( numberOfPropertiesAfter, numberOfPropertiesBefore + 1 );
	} );
} );
