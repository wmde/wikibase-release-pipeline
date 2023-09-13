import Util from 'wdio-mediawiki/Util';
import assert from 'assert';
import WikibaseApi from 'wdio-wikibase/wikibase.api';
import SuiteLoginPage from '../../helpers/pages/SuiteLoginPage';
import querystring from 'querystring';

const itemLabel = Util.getTestString( 'The Item' );

describe( 'Item', function () {
	let itemId = null;
	let propertyId = null;
	const propertyValue = 'PropertyExampleStringValue';
	const pageTitle = 'Test';

	beforeEach( async () => {
		await browser.waitForJobs();
		await browser.waitForJobs( { serverURL: process.env.MW_CLIENT_SERVER } );
	} );

	it( 'Special:NewItem should not be accessible on client', async () => {
		await browser.url(
			process.env.MW_CLIENT_SERVER + '/wiki/Special:NewItem?uselang=qqx'
		);
		const heading = await $( 'h1#firstHeading' );
		await heading.waitForDisplayed();
		const notFoundText = await heading.getText();
		assert.strictEqual( notFoundText, '(nosuchspecialpage)' );
	} );

	it( 'Special:NewItem should be visible on repo', async () => {
		await browser.url(
			process.env.MW_SERVER + '/wiki/Special:NewItem?uselang=qqx'
		);
		const heading = await $( 'h1#firstHeading' );
		await heading.waitForDisplayed();
		const createNewItem = await heading.getText();
		assert.strictEqual( createNewItem, '(special-newitem)' );
	} );

	it( 'Should create an item on repo', async () => {
		propertyId = await WikibaseApi.createProperty( 'string' );
		const data = {
			claims: [
				{
					mainsnak: {
						snaktype: 'value',
						property: propertyId,
						datavalue: { value: propertyValue, type: 'string' }
					},
					type: 'statement',
					rank: 'normal'
				}
			]
		};

		itemId = await WikibaseApi.createItem( itemLabel, data );

		await browser.url( process.env.MW_SERVER + '/wiki/Item:' + itemId );
		const button = await $(
			'.wikibase-toolbarbutton.wikibase-toolbar-item.wikibase-toolbar-button.wikibase-toolbar-button-add'
		);
		await button.waitForDisplayed();
	} );

	// creates usage
	it( 'Should be able to use the item on client with wikitext', async () => {
		const bodyText = await browser.editPage(
			process.env.MW_CLIENT_SERVER,
			pageTitle,
			'{{#statements:' + propertyId + '|from=' + itemId + '}}'
		);
		// label should come from repo property
		assert.equal( bodyText, propertyValue );
		assert( bodyText.includes( propertyValue ) );
	} );

	// This will generate a change that will dispatch
	it( 'Should be able to create site-links from item to client', async () => {
		// Create a site-link on a the Main_Page
		await browser.url(
			process.env.MW_SERVER +
			'/wiki/Special:SetSiteLink/Q1?site=client_wiki&page=' +
			pageTitle
		);
		const submitButtonEl = await $( '#wb-setsitelink-submit button' );
		await submitButtonEl.waitForDisplayed();
		await submitButtonEl.click();

		const siteLinkEl = await $( '.wikibase-sitelinklistview-listview li' );
		await siteLinkEl.waitForDisplayed();
		const siteLinkValue = await siteLinkEl.getText();

		// label should come from repo property
		assert(
			siteLinkValue.includes( 'client_wiki' ) &&
			siteLinkValue.includes( pageTitle )
		);
	} );

	it( 'Should be able to see site-link change is dispatched to client', async () => {
		const expectedSiteLinkChange = {
			type: 'external',
			ns: 0,
			title: pageTitle,
			comment: 'A Wikibase item has been linked to this page.'
		};

		const actualChange = await browser.getDispatchedExternalChange(
			process.env.MW_CLIENT_SERVER,
			expectedSiteLinkChange
		);

		assert.deepStrictEqual( actualChange, expectedSiteLinkChange );
	} );

	// This will generate a change that will dispatch
	it( 'Should be able to delete the item on repo', async () => {
		await SuiteLoginPage.loginAdmin();
		// goto delete page
		const query = { action: 'delete', title: 'Item:' + itemId };
		await browser.url(
			browser.config.baseUrl + '/index.php?' + querystring.stringify( query )
		);

		const destructiveButtonEl = await $(
			'.oo-ui-flaggedElement-destructive button'
		);
		await destructiveButtonEl.waitForDisplayed();
		await destructiveButtonEl.click();

		await browser.url( process.env.MW_SERVER + '/wiki/Item:' + itemId );
	} );

	it.skip( 'Should be able to see delete changes is dispatched to client for test page', async () => {
		await browser.pause( 30 * 1000 );

		const expectedTestDeletionChange = {
			type: 'external',
			ns: 0,
			title: pageTitle,
			comment: 'Associated Wikibase item deleted. Language links removed.'
		};

		const actualChange = await browser.getDispatchedExternalChange(
			process.env.MW_CLIENT_SERVER,
			expectedTestDeletionChange
		);

		assert.deepStrictEqual( actualChange, expectedTestDeletionChange );
	} );
} );
