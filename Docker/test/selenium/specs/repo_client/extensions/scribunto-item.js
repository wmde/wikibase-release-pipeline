'use strict';

const Util = require( 'wdio-mediawiki/Util' );
const assert = require( 'assert' );
const WikibaseApi = require( 'wdio-wikibase/wikibase.api' );
const LoginPage = require( 'wdio-mediawiki/LoginPage' );
const querystring = require( 'querystring' );
const fs = require( 'fs' );
const defaultFunctions = require( '../../../helpers/default-functions' );

const itemLabel = Util.getTestString( 'The Item' );

describe( 'Scribunto Item', function () {

	let itemId = null;
	let propertyId = null;
	const propertyValue = 'PropertyExampleStringValue';
	const luaPageTitle = 'RepoClientLuaTest';

	it( 'Should create an item on repo', function () {

		defaultFunctions.skipIfExtensionNotPresent( this, 'Scribunto' );

		propertyId = browser.call( () => WikibaseApi.createProperty( 'string' ) );
		const data = {
			claims: [
				{
					mainsnak: {
						snaktype: 'value',
						property: propertyId,
						datavalue: { value: propertyValue, type: 'string' } },
					type: 'statement', rank: 'normal'
				}
			]
		};

		itemId = browser.call(
			() => WikibaseApi.createItem( itemLabel, data )
		);

		browser.url( process.env.MW_SERVER + '/wiki/Item:' + itemId );
		$( '.wikibase-toolbarbutton.wikibase-toolbar-item.wikibase-toolbar-button.wikibase-toolbar-button-add' ).waitForDisplayed();
	} );

	it( 'Should be able to reference an item on client using Lua', function () {

		defaultFunctions.skipIfExtensionNotPresent( this, 'Scribunto' );

		const template = fs.readFileSync( 'data/repo-client.lua', 'utf8' );
		const luaScript = template.replace( '<ITEM_ID>', itemId ).replace( '<LANG>', 'en' );

		browser.editPage(
			process.env.MW_CLIENT_SERVER,
			'Module:RepoClient',
			luaScript
		);

		const executionContent = browser.editPage(
			process.env.MW_CLIENT_SERVER,
			luaPageTitle,
			'{{#invoke:RepoClient|testLuaExecution}}'
		);

		// should come from executed lua script
		assert( executionContent.includes( itemLabel ) );
	} );

	// This will generate a change that will dispatch
	it( 'Should be able to delete the item on repo', function () {

		defaultFunctions.skipIfExtensionNotPresent( this, 'Scribunto' );

		LoginPage.loginAdmin();

		// goto delete page
		const query = { action: 'delete', title: 'Item:' + itemId };
		browser.url(
			browser.config.baseUrl + '/index.php?' +
			querystring.stringify( query )
		);

		$( '.oo-ui-flaggedElement-destructive button' ).waitForDisplayed();
		$( '.oo-ui-flaggedElement-destructive button' ).click();

		browser.url( process.env.MW_SERVER + '/wiki/Item:' + itemId );
	} );

	it.skip( 'Should be able to see delete changes is dispatched to client for lua page', function () {

		defaultFunctions.skipIfExtensionNotPresent( this, 'Scribunto' );

		browser.pause( 30 * 1000 );

		const expectedDeletionChange = {
			type: 'external',
			ns: 0,
			title: luaPageTitle,
			comment: 'wikibase-comment-remove'
		};

		const actualChange = browser.getDispatchedExternalChange(
			process.env.MW_CLIENT_SERVER,
			expectedDeletionChange
		);

		assert.deepStrictEqual( actualChange, expectedDeletionChange );

	} );

} );
