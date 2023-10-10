import { getTestString } from 'wdio-mediawiki/Util.js';
import assert from 'assert';
import SuiteLoginPage from '../../../helpers/pages/SuiteLoginPage.js';
import { stringify } from 'querystring';
import { readFile } from 'fs/promises';
import { skipIfExtensionNotPresent } from '../../../helpers/default-functions.js';
import { utf8 } from '../../../helpers/readFileEncoding.js';
import WikibaseApi from '../../../helpers/WDIOWikibaseApiPatch.js';

const itemLabel = getTestString( 'The Item' );

describe( 'Scribunto Item', function () {
	let itemId: string = null;
	const propertyValue = 'PropertyExampleStringValue';
	const luaPageTitle = 'RepoClientLuaTest';

	it( 'Should create an item on repo', async () => {
		await skipIfExtensionNotPresent( this, 'Scribunto' );

		const propertyId = await WikibaseApi.createProperty( 'string' );
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
		const addButtonEl = await $(
			'.wikibase-toolbarbutton.wikibase-toolbar-item.wikibase-toolbar-button.wikibase-toolbar-button-add'
		);
		await addButtonEl.waitForDisplayed();
	} );

	it( 'Should be able to reference an item on client using Lua', async () => {
		await skipIfExtensionNotPresent( this, 'Scribunto' );

		const template = await readFile( new URL( 'repo-client.lua', import.meta.url ), utf8 );
		const luaScript = template
			.toString()
			.replace( '<ITEM_ID>', itemId )
			.replace( '<LANG>', 'en' );

		await browser.editPage(
			process.env.MW_CLIENT_SERVER,
			'Module:RepoClient',
			luaScript
		);

		const executionContent = await browser.editPage(
			process.env.MW_CLIENT_SERVER,
			luaPageTitle,
			'{{#invoke:RepoClient|testLuaExecution}}'
		);

		// should come from executed lua script
		assert( executionContent.includes( itemLabel ) );
	} );

	// This will generate a change that will dispatch
	it( 'Should be able to delete the item on repo', async () => {
		await skipIfExtensionNotPresent( this, 'Scribunto' );

		await SuiteLoginPage.loginAdmin();

		// goto delete page
		const query = { action: 'delete', title: 'Item:' + itemId };
		await browser.url(
			browser.options.baseUrl + '/index.php?' + stringify( query )
		);

		const destructiveButtonEl = await $(
			'.oo-ui-flaggedElement-destructive button'
		);
		await destructiveButtonEl.waitForDisplayed();
		await destructiveButtonEl.click();

		await browser.url( process.env.MW_SERVER + '/wiki/Item:' + itemId );
	} );

	it.skip( 'Should be able to see delete changes is dispatched to client for lua page', async () => {
		await skipIfExtensionNotPresent( this, 'Scribunto' );

		await browser.pause( 30 * 1000 );

		const expectedDeletionChange = {
			type: 'external',
			ns: 0,
			title: luaPageTitle,
			comment: 'wikibase-comment-remove'
		};

		const actualChange = await browser.getDispatchedExternalChange(
			process.env.MW_CLIENT_SERVER,
			expectedDeletionChange
		);

		assert.deepStrictEqual( actualChange, expectedDeletionChange );
	} );
} );
