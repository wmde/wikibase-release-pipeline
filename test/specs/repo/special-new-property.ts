import SpecialListPropertiesPage from '../../helpers/pages/special/list-properties.page.js';
import SpecialNewPropertyPage from '../../helpers/pages/special/new-property.page.js';
import {
	wikibasePropertyDatetime,
	wikibasePropertyItem,
	wikibasePropertyString
} from '../../helpers/wikibase-property-types.js';
import WikibasePropertyType from '../../types/wikibase-property-type.js';

const dataTypes = [
	wikibasePropertyItem,
	wikibasePropertyString,
	wikibasePropertyDatetime
];

describe( 'Special:NewProperty', function () {
	// eslint-disable-next-line mocha/no-setup-in-describe
	dataTypes.forEach( ( dataType: WikibasePropertyType ) => {
		// eslint-disable-next-line mocha/no-setup-in-describe
		describe( `Should be able to work with datatype ${ dataType.name }`, function () {
			before( async function () {
				if ( dataType.extensionNeeded ) {
					await browser.skipIfExtensionNotPresent(
						this,
						dataType.extensionNeeded
					);
				}
			} );

			it( `Should be able to create a new property of datatype ${ dataType.name }`, async function () {
				this.retries( 4 );

				await SpecialNewPropertyPage.open();

				await SpecialNewPropertyPage.labelInput.setValue(
					`Cool ${ dataType.name } label`
				);
				await SpecialNewPropertyPage.descriptionInput.setValue(
					`Cool ${ dataType.name } description`
				);
				await SpecialNewPropertyPage.aliasesInput.setValue(
					`Great ${ dataType.name }!|Greatest ${ dataType.name }!`
				);

				await SpecialNewPropertyPage.datatypeInput.click();
				await $( 'oo-ui-menuSelectWidget' );
				await $( `.oo-ui-labelElement-label=${ dataType.name }` ).click();

				await SpecialNewPropertyPage.submit();

				await browser.waitForJobs();

				await expect( browser ).toHaveUrl(
					/http:\/\/wikibase\.svc\/wiki\/Property:P\d+/
				);

				await expect( $( '.wikibase-propertyview-datatype-value' ) ).toHaveText(
					dataType.name
				);
			} );
		} );
	} );

	it( 'Should be able to see newly created properties in list of properties special page', async function () {
		await SpecialListPropertiesPage.open( {
			dataType: wikibasePropertyString.urlName,
			limit: 1000
		} );
		const numberOfPropertiesBefore =
			await SpecialListPropertiesPage.properties.length;

		await SpecialNewPropertyPage.open( {
			datatype: wikibasePropertyString.urlName
		} );
		await SpecialNewPropertyPage.labelInput.setValue(
			`Property type ${ wikibasePropertyString.urlName }`
		);
		await SpecialNewPropertyPage.descriptionInput.setValue(
			`A ${ wikibasePropertyString.urlName } property`
		);
		await SpecialNewPropertyPage.submit();

		let numberOfPropertiesAfter: number;

		// Depends on $wgWBRepoSettings['sharedCacheDuration'] being set to 1 second
		// from the the MediaWiki default of 30 mins
		await browser.waitUntil(
			async () => {
				await SpecialListPropertiesPage.open( {
					dataType: wikibasePropertyString.urlName,
					limit: 1000
				} );
				numberOfPropertiesAfter =
					await SpecialListPropertiesPage.properties.length;
				return numberOfPropertiesAfter === numberOfPropertiesBefore + 1;
			},
			{
				timeoutMsg:
					'expected new property to be included in list within 10 seconds',
				interval: 1000,
				timeout: 10000
			}
		);
	} );
} );
