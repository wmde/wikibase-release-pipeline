import SpecialListProperties from '../../helpers/pages/special/list-properties.page.js';
import SpecialNewProperty from '../../helpers/pages/special/new-property.page.js';
import {
	wikibasePropertyItem,
	wikibasePropertyString
} from '../../helpers/wikibase-property-types.js';
import WikibasePropertyType from '../../types/wikibase-property-type.js';

const dataTypes = [ wikibasePropertyItem, wikibasePropertyString ];

describe( 'Special:NewProperty', function () {
	// eslint-disable-next-line mocha/no-setup-in-describe
	dataTypes.forEach( ( dataType: WikibasePropertyType ) => {
		it( `Should be able to create a new property of datatype ${dataType.name}`, async () => {
			await SpecialNewProperty.open();

			await SpecialNewProperty.labelInput.setValue(
				`Cool ${dataType.name} label`
			);
			await SpecialNewProperty.descriptionInput.setValue(
				`Cool ${dataType.name} description`
			);
			await SpecialNewProperty.aliasesInput.setValue(
				`Great ${dataType.name}!|Greatest ${dataType.name}!`
			);

			await SpecialNewProperty.datatypeInput.click();
			await $( 'oo-ui-menuSelectWidget' );
			await $( `.oo-ui-labelElement-label=${dataType.name}` ).click();

			await SpecialNewProperty.submitBtn.click();

			const dataTypeText = await $(
				'.wikibase-propertyview-datatype-value'
			).getText();

			expect( dataTypeText ).toEqual( dataType.name );
		} );
	} );

	it( 'Should be able to see newly created properties in list of properties special page', async () => {
		await SpecialListProperties.openParams( {
			dataType: wikibasePropertyString.urlName,
			limit: 1000
		} );
		const numberOfPropertiesBefore =
			await SpecialListProperties.properties.length;

		await SpecialNewProperty.open( wikibasePropertyString.urlName );
		await SpecialNewProperty.labelInput.setValue(
			`Property type ${wikibasePropertyString.urlName}`
		);
		await SpecialNewProperty.descriptionInput.setValue(
			`A ${wikibasePropertyString.urlName} property`
		);
		await SpecialNewProperty.submitBtn.click();

		let numberOfPropertiesAfter;

		// Depends on $wgWBRepoSettings['sharedCacheDuration'] being set to 1 second
		// from the the MediaWiki default of 30 mins
		await browser.waitUntil( async () => {
			await SpecialListProperties.openParams( {
				dataType: wikibasePropertyString.urlName,
				limit: 1000
			} );
			numberOfPropertiesAfter = await SpecialListProperties.properties.length;
			return numberOfPropertiesAfter === numberOfPropertiesBefore + 1;
		}, {
			timeoutMsg: 'expected new property to be included in list within 10 seconds',
			interval: 1000,
			timeout: 10000
		} );
	} );
} );
