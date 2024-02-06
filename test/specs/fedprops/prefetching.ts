import assert from 'assert';
import { getTestString } from 'wdio-mediawiki/Util.js';
import WikibaseApi from 'wdio-wikibase/wikibase.api.js';
import ItemPage from '../../helpers/pages/entity/item.page.js';

describe( 'Property Prefetching', function () {
	let itemId: string;
	const itemLabel = 'T267743-';
	const NUM_PROPERTIES = 25;

	it( 'can add many federated properties and it shows up in the ui', async () => {
		await browser.url(
			'https://www.wikidata.org/wiki/Special:ListProperties?datatype=string'
		);
		await $( 'ol.special li a' );

		const links = ( await $$( 'ol.special li a' ) ).slice( 0, NUM_PROPERTIES );

		const claims = await Promise.all(
			links.map( async ( link ) => {
				const linkHref = await link.getAttribute( 'href' );
				const prop = `http://www.wikidata.org/entity/${linkHref.replace(
					'/wiki/Property:',
					''
				)}`;
				return {
					mainsnak: {
						snaktype: 'value',
						property: prop,
						datavalue: { value: 'test-value', type: 'string' }
					},
					type: 'statement',
					rank: 'normal'
				};
			} )
		);
		assert.strictEqual( claims.length, NUM_PROPERTIES );

		const data = { claims: claims };
		itemId = await WikibaseApi.createItem( getTestString( itemLabel ), data );

		await ItemPage.open( itemId );
		await $(
			'.wikibase-toolbarbutton.wikibase-toolbar-item.wikibase-toolbar-button.wikibase-toolbar-button-add'
		);
	} );

	it( 'should delete all statements and generate individual changes', async () => {
		const statements = await $$( '.wikibase-statementview' );
		const propertyGuids = await Promise.all(
			statements.map( async ( statement ) => statement.getAttribute( 'id' ) )
		);

		assert.strictEqual( propertyGuids.length, NUM_PROPERTIES );

		for ( const guid of propertyGuids ) {
			const response = await browser.deleteClaim( guid );
			assert.strictEqual( response.success, 1 );
		}

		// Sleep for 2 seconds to ensure post edit things run
		// eslint-disable-next-line wdio/no-pause
		await browser.pause( 2000 );
	} );

	it( 'Should render history page list within threshold', async () => {
		await ItemPage.open( itemId, { action: 'history' } );
		await $( '#pagehistory' );

		// +1 for the initial item creation
		assert.strictEqual(
			( await $$( '#pagehistory li' ) ).length,
			NUM_PROPERTIES + 1
		);
	} );

	it( 'Should render recent changes list within threshold', async () => {
		await browser.url(
			`${testEnv.vars.WIKIBASE_URL}/wiki/Special:RecentChanges?limit=50&days=7&urlversion=2&enhanced=0`
		);
		await $( 'ul.special' );

		// +1 for the initial item creation
		// +1 for the Main Page creation?
		// +1 for ?
		assert.strictEqual( ( await $$( 'ul.special li' ) ).length, NUM_PROPERTIES + 3 );
	} );

	it( 'Should be able to change limit', async () => {
		await $( 'div.mw-rcfilters-ui-changesLimitAndDateButtonWidget' ).click();

		const setChangeNumber = 100;
		await $( 'div.mw-rcfilters-ui-changesLimitPopupWidget' )
			.$( `span=${setChangeNumber}` )
			.click();
		expect(
			(
				await $( 'div.mw-rcfilters-ui-changesLimitAndDateButtonWidget' ).getText()
			).includes( `${setChangeNumber} changes` )
		);
	} );
} );
