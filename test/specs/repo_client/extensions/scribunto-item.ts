import { getTestString } from 'wdio-mediawiki/Util.js';
import assert from 'assert';
import LoginPage from 'wdio-mediawiki/LoginPage.js';
import { stringify } from 'querystring';
import { readFile } from 'fs/promises';
import { utf8 } from '../../../helpers/readFileEncoding.js';
import WikibaseApi from 'wdio-wikibase/wikibase.api.js';
import ExternalChange from '../../../helpers/types/external-change.js';
import envVars from '../../../setup/envVars.js';

const itemLabel = getTestString( 'The Item' );

describe( 'Scribunto Item', function () {
	let itemId: string;
	const propertyValue = 'PropertyExampleStringValue';
	const luaPageTitle = 'RepoClientLuaTest';

	beforeEach( async function () {
		await browser.skipIfExtensionNotPresent( this, 'Scribunto' );
	} );

	it( 'Should create an item on repo', async () => {
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

		await browser.url( envVars.WIKIBASE_URL + '/wiki/Item:' + itemId );
		await $(
			'.wikibase-toolbarbutton.wikibase-toolbar-item.wikibase-toolbar-button.wikibase-toolbar-button-add'
		);
	} );

	it( 'Should be able to reference an item on client using Lua', async () => {
		// eslint-disable-next-line security/detect-non-literal-fs-filename
		const template = await readFile(
			new URL( 'repo-client.lua', import.meta.url ),
			utf8
		);
		const luaScript = template
			.toString()
			.replace( '<ITEM_ID>', itemId )
			.replace( '<LANG>', 'en' );

		await browser.editPage(
			envVars.WIKIBASE_CLIENT_URL,
			'Module:RepoClient',
			luaScript
		);

		const executionContent = await browser.editPage(
			envVars.WIKIBASE_CLIENT_URL,
			luaPageTitle,
			'{{#invoke:RepoClient|testLuaExecution}}'
		);

		// should come from executed lua script
		assert( executionContent.includes( itemLabel ) );
	} );

	// This will generate a change that will dispatch
	it( 'Should be able to delete the item on repo', async () => {
		await LoginPage.login( envVars.MW_ADMIN_NAME, envVars.MW_ADMIN_PASS );

		// goto delete page
		const query = { action: 'delete', title: 'Item:' + itemId };
		await browser.url(
			browser.options.baseUrl + '/index.php?' + stringify( query )
		);

		await $( '.oo-ui-flaggedElement-destructive button' ).click();

		await browser.url( `${envVars.WIKIBASE_URL}/wiki/Item:${itemId}` );
	} );

	it.skip( 'Should be able to see delete changes is dispatched to client for lua page', async () => {
		// eslint-disable-next-line wdio/no-pause
		await browser.pause( 30 * 1000 );

		const expectedDeletionChange: ExternalChange = {
			type: 'external',
			ns: 0,
			title: luaPageTitle,
			comment: 'wikibase-comment-remove'
		};

		const actualChange = await browser.getDispatchedExternalChange(
			envVars.WIKIBASE_CLIENT_URL,
			expectedDeletionChange
		);

		assert.deepStrictEqual( actualChange, expectedDeletionChange );
	} );
} );
