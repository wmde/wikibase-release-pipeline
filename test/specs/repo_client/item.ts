import assert from 'assert';
import { stringify } from 'querystring';
import LoginPage from 'wdio-mediawiki/LoginPage.js';
import { getTestString } from 'wdio-mediawiki/Util.js';
import WikibaseApi from 'wdio-wikibase/wikibase.api.js';
import ExternalChange from '../../helpers/types/external-change.js';

const itemLabel = getTestString( 'The Item' );

describe( 'Item', function () {
	let itemId: string = null;
	let propertyId: string = null;
	const propertyValue = 'PropertyExampleStringValue';
	const pageTitle = 'Test';

	beforeEach( async () => {
		await browser.waitForJobs();
		await browser.waitForJobs( globalThis.env.MW_CLIENT_SERVER );
	} );

	it( 'Special:NewItem should not be accessible on client', async () => {
		await browser.url(
			globalThis.env.MW_CLIENT_SERVER + '/wiki/Special:NewItem?uselang=qqx'
		);
		const notFoundText = await $( 'h1#firstHeading' ).getText();
		assert.strictEqual( notFoundText, '(nosuchspecialpage)' );
	} );

	it( 'Special:NewItem should be visible on repo', async () => {
		await browser.url(
			globalThis.env.MW_SERVER + '/wiki/Special:NewItem?uselang=qqx'
		);
		const createNewItem = await $( 'h1#firstHeading' ).getText();
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

		await browser.url( `${globalThis.env.MW_SERVER}/wiki/Item:${itemId}` );
		await $(
			'.wikibase-toolbarbutton.wikibase-toolbar-item.wikibase-toolbar-button.wikibase-toolbar-button-add'
		);
	} );

	// creates usage
	it( 'Should be able to use the item on client with wikitext', async () => {
		const bodyText = await browser.editPage(
			globalThis.env.MW_CLIENT_SERVER,
			pageTitle,
			`{{#statements:${propertyId}|from=${itemId}}}`
		);
		// label should come from repo property
		assert.equal( bodyText, propertyValue );
		assert( bodyText.includes( propertyValue ) );
	} );

	// This will generate a change that will dispatch
	it( 'Should be able to create site-links from item to client', async () => {
		// Create a site-link on a the Main_Page
		await browser.url(
			`${globalThis.env.MW_SERVER}/wiki/Special:SetSiteLink/Q1?site=client_wiki&page=${pageTitle}`
		);
		await $( '#wb-setsitelink-submit button' ).click();

		const siteLinkValue = await $(
			'.wikibase-sitelinklistview-listview li'
		).getText();

		// label should come from repo property
		assert( siteLinkValue.includes( 'client_wiki' ) );
		assert( siteLinkValue.includes( pageTitle ) );
	} );

	it( 'Should be able to see site-link change is dispatched to client', async () => {
		const expectedSiteLinkChange: ExternalChange = {
			type: 'external',
			ns: 0,
			title: pageTitle,
			comment: 'A Wikibase item has been linked to this page.'
		};

		const actualChange = await browser.getDispatchedExternalChange(
			globalThis.env.MW_CLIENT_SERVER,
			expectedSiteLinkChange
		);

		assert.deepStrictEqual( actualChange, expectedSiteLinkChange );
	} );

	// This will generate a change that will dispatch
	it( 'Should be able to delete the item on repo', async () => {
		await LoginPage.login( globalThis.env.MW_ADMIN_NAME, globalThis.env.MW_ADMIN_PASS );

		// goto delete page
		const query = { action: 'delete', title: 'Item:' + itemId };
		await browser.url(
			`${browser.options.baseUrl}/index.php?${stringify( query )}`
		);

		await $( '.oo-ui-flaggedElement-destructive button' ).click();

		await browser.url( `${globalThis.env.MW_SERVER}/wiki/Item:${itemId}` );
	} );

	it.skip( 'Should be able to see delete changes is dispatched to client for test page', async () => {
		// eslint-disable-next-line wdio/no-pause
		await browser.pause( 30 * 1000 );

		const expectedTestDeletionChange: ExternalChange = {
			type: 'external',
			ns: 0,
			title: pageTitle,
			comment: 'Associated Wikibase item deleted. Language links removed.'
		};

		const actualChange = await browser.getDispatchedExternalChange(
			globalThis.env.MW_CLIENT_SERVER,
			expectedTestDeletionChange
		);

		assert.deepStrictEqual( actualChange, expectedTestDeletionChange );
	} );
} );
