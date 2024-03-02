import assert from 'assert';
import { AxiosResponse } from 'axios';
import lodash from 'lodash';
import WikibaseApi from 'wdio-wikibase/wikibase.api.js';
import SpecialEntityDataPage from '../../helpers/pages/special/entity-data.page.js';

type ReferenceValue = {
	id: string;
};

function getReferenceValue(
	response: AxiosResponse,
	propertyId: string | number,
	refPropertyId: string | number
): string | ReferenceValue {
	const references = response.data.claims[ propertyId ][ 0 ].references;
	return references[ 0 ].snaks[ refPropertyId ][ 0 ].datavalue.value;
}

function getQualifierType(
	response: AxiosResponse,
	propertyId: string | number,
	qualPropertyId: string
): string {
	for ( const statements of response.data.claims[ propertyId ] ) {
		if ( 'qualifiers' in statements ) {
			if ( qualPropertyId in statements.qualifiers ) {
				return statements.qualifiers[ qualPropertyId ][ 0 ].datatype;
			}
		}
	}
}

const mainSnakDataTypes = [
	'string',
	'wikibase-item',
	'url',
	'quantity',
	'time'
];
const qualifierSnakDataTypes = [
	'string',
	'wikibase-item',
	'url',
	'quantity',
	'time'
];
const exampleSnakValues = {
	string: '"cat"',
	'wikibase-item': 'Q1',
	url: '"https://example.com"',
	quantity: '5',
	time: '+1967-01-17T00:00:00Z/11'
};

describe( 'QuickStatements Service', function () {
	let propertyId = null;
	let propertyIdItem = null;
	let propertyURL = null;

	it( 'Should be able to load the start page', async function () {
		await browser.url( testEnv.vars.QUICKSTATEMENTS_URL );
		await $( 'body' ).$( 'p*=QuickStatements is a tool' );
	} );

	it( 'Should be able to log in', async function () {
		await browser.url(
			`${ testEnv.vars.QUICKSTATEMENTS_URL }/api.php?action=oauth_redirect`
		);

		// login after redirect
		const wpNameEl = await $( '#wpName1' );
		await wpNameEl.waitForDisplayed();
		await wpNameEl.setValue( testEnv.vars.MW_ADMIN_NAME );

		const wpPasswordEl = await $( '#wpPassword1' );
		await wpPasswordEl.waitForDisplayed();
		await wpPasswordEl.setValue( testEnv.vars.MW_ADMIN_PASS );

		const wpLoginButtonEl = await $( '#wpLoginAttempt' );
		await wpLoginButtonEl.waitForDisplayed();
		await wpLoginButtonEl.click();

		// oauth dialog
		await $( '#mw-mwoauth-authorize-form' );
		await $( '#mw-mwoauth-accept' ).click();

		// eslint-disable-next-line wdio/no-pause
		await browser.pause( 2 * 1000 );

		// redirect back to app
		await expect( $( 'nav.navbar' ) ).toHaveTextContaining( 'QuickStatements' );
	} );

	it( 'Should be able to click batch button and be taken to the next page', async function () {
		await browser.url( `${ testEnv.vars.QUICKSTATEMENTS_URL }/#` );
		await $( 'a[tt="new_batch"]=New batch' ).click();

		await expect( $( 'span=Create new command batch for' ) ).toExist();
	} );

	it( 'Should be able to create two items', async function () {
		await browser.url( `${ testEnv.vars.QUICKSTATEMENTS_URL }/#/batch` );

		await browser.executeQuickStatement( 'CREATE\nCREATE' );

		const responseQ1Data = await SpecialEntityDataPage.getData( 'Q1' );
		const responseQ2Data = await SpecialEntityDataPage.getData( 'Q2' );

		expect( responseQ1Data.entities.Q1.id ).toBe( 'Q1' );
		expect( responseQ2Data.entities.Q2.id ).toBe( 'Q2' );
	} );

	it( 'Should be able to create item with label', async function () {
		await browser.url( `${ testEnv.vars.QUICKSTATEMENTS_URL }/#/batch` );

		await browser.executeQuickStatement( 'CREATE\nLAST|Len|"Best label"' );

		const responseQ3Data = await SpecialEntityDataPage.getData( 'Q3' );

		expect( responseQ3Data.entities.Q3.labels.en.value ).toBe( 'Best label' );
	} );

	it( 'Should be able to create an item with statement', async function () {
		await browser.url( `${ testEnv.vars.QUICKSTATEMENTS_URL }/#/batch` );

		const stringPropertyId = await WikibaseApi.createProperty( 'string' );

		await browser.executeQuickStatement(
			`CREATE||LAST|Len|"freshwater eel"||LAST|${ stringPropertyId }|"slippery fish"`
		);

		const responseQ4Data = await SpecialEntityDataPage.getData( 'Q4' );
		expect( responseQ4Data.entities.Q4.labels.en.value ).toBe( 'freshwater eel' );
		expect(
			responseQ4Data.entities.Q4.claims.P1[ 0 ].mainsnak.datavalue.value
		).toBe( 'slippery fish' );
	} );

	it( 'Should be able to add an alias to an item', async function () {
		await browser.executeQuickStatement( 'Q1|ASv|"Kommer det funka?"' );

		// go look at wikibase
		const responseQ1Data = await SpecialEntityDataPage.getData( 'Q1' );

		assert( lodash.isEmpty( responseQ1Data.entities.Q1.aliases ) !== true );
	} );

	it( 'Should be able to add a label to an item', async function () {
		await browser.executeQuickStatement( 'Q1|LSv|"Some label"' );

		// go look at wikibase
		const responseQ1Data = await SpecialEntityDataPage.getData( 'Q1' );

		assert( lodash.isEmpty( responseQ1Data.entities.Q1.labels ) !== true );
	} );

	it( 'Should be able to add a description to an item', async function () {
		await browser.executeQuickStatement( 'Q1|DSv|"Kommer det funka?"' );

		// go look at wikibase
		const responseQ1Data = await SpecialEntityDataPage.getData( 'Q1' );

		assert( lodash.isEmpty( responseQ1Data.entities.Q1.descriptions ) !== true );
	} );

	it.skip( 'Should be able to add a sitelink to an item', async function () {
		await browser.executeQuickStatement( 'Q1|Sclient_wiki|"Main_Page"' );

		// go look at wikibase
		const responseQ1Data = await SpecialEntityDataPage.getData( 'Q1' );

		assert( lodash.isEmpty( responseQ1Data.entities.Q1.sitelinks ) !== true );
	} );

	it( 'Should be able to add a statement to an item', async function () {
		propertyId = await WikibaseApi.getProperty( 'string' );

		await browser.executeQuickStatement( `Q1|${ propertyId }|"Will it blend?"` );

		const responseQ1Data = await SpecialEntityDataPage.getData( 'Q1' );
		expect( responseQ1Data.entities.Q1.claims[ propertyId ][ 0 ].type ).toBe(
			'statement'
		);
		expect(
			responseQ1Data.entities.Q1.claims[ propertyId ][ 0 ].mainsnak.datavalue.value
		).toBe( 'Will it blend?' );
	} );

	describe( 'Should be able to add qualifiers to statements with a range of datatypes', function () {
		// should be disabled for dynamic tests
		// eslint-disable-next-line mocha/no-setup-in-describe
		mainSnakDataTypes.forEach( ( mainSnakDataType ) => {
			qualifierSnakDataTypes.forEach( ( qualifierSnakDataType ) => {
				it( `Should be able to add a ${ mainSnakDataType } statement with a ${ qualifierSnakDataType } qualifier.`, async function () {
					const itemId = await WikibaseApi.createItem( 'qualifier-item', {} );

					const mainPropertyId =
						await WikibaseApi.getProperty( mainSnakDataType );
					const qualifierPropertyId = await WikibaseApi.getProperty(
						qualifierSnakDataType
					);
					await browser.executeQuickStatement(
						`${ itemId }|${ mainPropertyId }|${ exampleSnakValues[ mainSnakDataType ] }|${ qualifierPropertyId }|${ exampleSnakValues[ qualifierSnakDataType ] }`
					);

					const responseQ1 = await browser.makeRequest(
						`${ testEnv.vars.WIKIBASE_URL }/w/api.php?action=wbgetclaims&format=json&entity=${ itemId }`
					);
					expect(
						getQualifierType( responseQ1, mainPropertyId, qualifierPropertyId )
					).toBe( qualifierSnakDataType );
				} );
			} );
		} );
	} );

	it( 'Should be able to add statement with qualifiers', async function () {
		propertyIdItem = await WikibaseApi.getProperty( 'wikibase-item' );

		await browser.executeQuickStatement(
			`Q1|${ propertyIdItem }|Q1|${ propertyIdItem }|Q1`
		);

		const responseQ1Data = await SpecialEntityDataPage.getData( 'Q1' );
		expect( responseQ1Data.entities.Q1.claims[ propertyId ][ 0 ].type ).toBe(
			'statement'
		);
	} );

	it( 'Should be able to add a property with "wikibase-item" reference', async function () {
		const itemId = await WikibaseApi.createItem( 'reference-item', {} );

		propertyIdItem = await WikibaseApi.getProperty( 'wikibase-item' );
		const propertyNumber = propertyIdItem.replace( 'P', '' );
		await browser.executeQuickStatement(
			`${ itemId }|${ propertyIdItem }|Q2|S${ propertyNumber }|Q2|S${ propertyNumber }|Q2`
		);

		const response = await browser.makeRequest(
			`${ testEnv.vars.WIKIBASE_URL }/w/api.php?action=wbgetclaims&format=json&entity=${ itemId }`
		);
		const refValue = getReferenceValue(
			response,
			propertyIdItem,
			propertyIdItem
		);

		assert( typeof refValue !== 'string' );
		expect( refValue.id ).toBe( 'Q2' );
	} );

	it( 'Should be able to add a property with "url" reference', async function () {
		const itemId = await WikibaseApi.createItem( 'reference-url', {} );
		propertyURL = await WikibaseApi.getProperty( 'url' );
		const url = '"https://www.wikidata.org"';
		const propertyNumber = propertyURL.replace( 'P', '' );

		await browser.executeQuickStatement(
			`${ itemId }|${ propertyIdItem }|Q1|S${ propertyNumber }|${ url }`
		);

		const response = await browser.makeRequest(
			`${ testEnv.vars.WIKIBASE_URL }/w/api.php?action=wbgetclaims&format=json&entity=${ itemId }`
		);
		const refValue = getReferenceValue( response, propertyIdItem, propertyURL );

		expect( refValue ).toBe( 'https://www.wikidata.org' );
	} );

	it( 'Should be able to add a property with "string" reference', async function () {
		const itemId = await WikibaseApi.createItem( 'reference-string', {} );
		const stringValue = '"some string"';
		const propertyNumber = propertyId.replace( 'P', '' );
		await browser.executeQuickStatement(
			`${ itemId }|${ propertyIdItem }|Q1|S${ propertyNumber }|${ stringValue }`
		);

		const response = await browser.makeRequest(
			`${ testEnv.vars.WIKIBASE_URL }/w/api.php?action=wbgetclaims&format=json&entity=${ itemId }`
		);
		const refValue = getReferenceValue( response, propertyIdItem, propertyId );

		expect( refValue ).toBe( 'some string' );
	} );

	it( 'Should be able to add and remove a property on an item', async function () {
		const itemId = await WikibaseApi.createItem( 'add-remove', {} );

		await browser.executeQuickStatement( `${ itemId }|${ propertyIdItem }|Q1` );

		let responseData = await SpecialEntityDataPage.getData( itemId );
		expect( propertyIdItem in responseData.entities[ itemId ].claims ).toBe( true );

		await browser.executeQuickStatement( `-${ itemId }|${ propertyIdItem }|Q1` );

		responseData = await SpecialEntityDataPage.getData( itemId );
		expect( propertyIdItem in responseData.entities[ itemId ].claims ).toBe( false );
	} );

	it( 'Should be able to change label', async function () {
		await browser.executeQuickStatement( 'Q1|LSv|"Some other label"' );

		const responseQ1Data = await SpecialEntityDataPage.getData( 'Q1' );
		expect( responseQ1Data.entities.Q1.labels.sv.value ).toBe( 'Some other label' );
	} );

	it( 'Should be able to merge two items', async function () {
		await browser.url( `${ testEnv.vars.QUICKSTATEMENTS_URL }/#/batch` );

		await browser.executeQuickStatement( 'MERGE|Q1|Q2' );

		const responseQ2Data = await SpecialEntityDataPage.getData( 'Q2' );
		expect( responseQ2Data.entities.Q1.id ).toBe( 'Q1' );
	} );

	it( 'Should have a Last Batches button', async function () {
		await browser.url( `${ testEnv.vars.QUICKSTATEMENTS_URL }/#/batch` );

		await $( 'a[tt="show_your_last_batches"]=Your last batches' ).click();

		await expect( $( 'span[tt="show_last_batches"]=Last batches' ) ).toExist();
	} );
} );
