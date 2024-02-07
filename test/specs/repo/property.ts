import WikibaseApi from 'wdio-wikibase/wikibase.api.js';
import StatementComponent from '../../helpers/pages/component/statement.js';
import PropertyPage from '../../helpers/pages/entity/property.page.js';
import { Page } from '../../helpers/pages/page.js';
import SpecialEntityDataPage from '../../helpers/pages/special/entity-data.page.js';
import {
	wikibasePropertyItem,
	wikibasePropertyString
} from '../../helpers/wikibase-property-types.js';
import { Claim, Reference } from '../../types/entity-data.js';
import WikibasePropertyType from '../../types/wikibase-property-type.js';

const dataTypes = [ wikibasePropertyItem, wikibasePropertyString ];

const statementText = 'STATEMENT';
const referenceText = 'REFERENCE';
const undoSummaryText = 'UNDO_SUMMARY';

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
				await PropertyPage.open( propertyId );
			} );

			it( 'Should be able to add statement to property', async () => {
				await StatementComponent.addStatementLink.click();
				// fill out property id for statement
				await StatementComponent.selectProperty( stringPropertyId );
				await browser.keys( statementText.split( '' ) );
				await StatementComponent.saveStatementLink.click();
			} );

			it( 'Should be able to see added statement', async () => {
				this.retries( 4 );
				await expect( $( `div=${statementText}` ) ).toExist();
				await expect( $( `aria/Property:${stringPropertyId}` ) ).toHaveText(
					stringPropertyId
				);
			} );

			it( 'Should be able to add reference to property', async () => {
				await StatementComponent.addReferenceLink.click();
				// fill out property id for reference
				await $( '.ui-entityselector-input' ).isFocused();
				await StatementComponent.selectProperty( stringPropertyId );
				await browser.keys( referenceText.split( '' ) );
				await StatementComponent.saveStatementLink.click();
			} );

			it( 'Should be able to see added reference', async function () {
				this.retries( 4 );
				await $( '=1 reference' ).click();
				await expect( $( `div=${referenceText}` ) ).toExist();
			} );

			it( 'Should contain statement and reference in EntityData', async function () {
				this.retries( 4 );
				const responseData = await SpecialEntityDataPage.getData( propertyId );
				const claim: Claim =
					responseData.entities[ propertyId ].claims[ stringPropertyId ][ 0 ];
				const reference: Reference =
					claim.references[ 0 ].snaks[ stringPropertyId ][ 0 ];
				await expect( claim.mainsnak.datavalue.value ).toEqual( statementText );
				await expect( reference.datavalue.value ).toEqual( referenceText );
			} );

			it( 'Should show changes in "View history" tab', async () => {
				await PropertyPage.openHistoryTab();
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

			it( 'Should be able to revert a change', async () => {
				await PropertyPage.openHistoryTab();
				await expect( ( await PropertyPage.changeHistoryItems ).length ).toBe( 3 );
				await PropertyPage.mostRecentChange.$( 'a=undo' ).click();
				await $(
					'label=Summary (will be appended to an automatically generated summary):'
				).click();
				await browser.keys( undoSummaryText.split( '' ) );
				await $( 'button=Save page' ).click();
			} );

			it( 'Should be able to see reverted change', async () => {
				await PropertyPage.openHistoryTab();
				await expect( ( await PropertyPage.changeHistoryItems ).length ).toBe( 4 );
				await expect( $( 'span.mw-tag-marker-mw-undo' ) ).toExist();
				const mostRecentRevisionText =
					await PropertyPage.mostRecentChange.getText();
				expect( mostRecentRevisionText.includes( undoSummaryText ) );
			} );

			it( 'Should be able to set label, description, aliases', async () => {
				await new Page().open( '/wiki/Special:SetLabelDescriptionAliases/' );
				await $( 'label=ID:' ).click();
				await browser.keys( propertyId.split( '' ) );
				await $( 'span=Set label, description and aliases' ).click();

				await $( 'label=Label:' ).click();
				await browser.keys( `${dataType.name} Label`.split( '' ) );
				await $( 'label=Description:' ).click();
				await browser.keys( `${dataType.name} Description`.split( '' ) );
				await $( 'label=Aliases:' ).click();
				await browser.keys(
					`${dataType.name} Alias A|${dataType.name} Alias B`.split( '' )
				);

				await $( 'span=Set label, description and aliases' ).click();
			} );

			it( 'Should be able to see updated label, description, aliases', async () => {
				await expect(
					$( `span.wikibase-labelview-text=${dataType.name} Label` )
				).toExist();
				await expect(
					$( `span.wikibase-descriptionview-text=${dataType.name} Description` )
				).toExist();
				await expect(
					$( `li.wikibase-aliasesview-list-item=${dataType.name} Alias A` )
				).toExist();
				await expect(
					$( `li.wikibase-aliasesview-list-item=${dataType.name} Alias B` )
				).toExist();
			} );
		} );
	} );
} );
