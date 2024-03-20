import { getTestString } from 'wdio-mediawiki/Util.js';
import WikibaseApi from 'wdio-wikibase/wikibase.api.js';
import ItemPage from '../../helpers/pages/entity/item.page.js';
import page from '../../helpers/pages/page.js';

describe( 'Property Prefetching', function () {
	let itemId: string;
	const itemLabel = 'T267743-';
	const NUM_PROPERTIES = 25;

	it( 'can add many federated properties and it shows up in the ui', async function () {
		await browser.url(
			'https://www.wikidata.org/wiki/Special:ListProperties?datatype=string'
		);
		await $( 'ol.special li a' );

		const links = ( await $$( 'ol.special li a' ) ).slice( 0, NUM_PROPERTIES );

		const claims = await Promise.all(
			links.map( async ( link ) => {
				const linkHref = await link.getAttribute( 'href' );
				const prop = `http://www.wikidata.org/entity/${ linkHref.replace(
					'/wiki/Property:',
					''
				) }`;
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
		expect( claims ).toHaveLength( NUM_PROPERTIES );

		const data = { claims: claims };
		itemId = await WikibaseApi.createItem( getTestString( itemLabel ), data );

		await ItemPage.open( itemId );
		await $(
			'.wikibase-toolbarbutton.wikibase-toolbar-item.wikibase-toolbar-button.wikibase-toolbar-button-add'
		);
	} );

	it( 'should delete all statements and generate individual changes', async function () {
		const statements = await $$( '.wikibase-statementview' );
		const propertyGuids = await Promise.all(
			statements.map( async ( statement ) => statement.getAttribute( 'id' ) )
		);

		expect( propertyGuids ).toHaveLength( NUM_PROPERTIES );

		for ( const guid of propertyGuids ) {
			const response = await browser.deleteClaim( guid );
			expect( response.success ).toEqual( 1 );
		}

		// Sleep for 2 seconds to ensure post edit things run
		// eslint-disable-next-line wdio/no-pause
		await browser.pause( 2000 );
	} );

	it( 'Should render history page list within threshold', async function () {
		await ItemPage.open( itemId, { action: 'history' } );
		await $( '#pagehistory' );

		// +1 for the initial item creation
		await expect( $$( '#pagehistory li' ) ).resolves.toHaveLength(
			NUM_PROPERTIES + 1
		);
	} );

	it( 'Should render recent changes list within threshold', async function () {
		await page.open(
			'/wiki/Special:RecentChanges?limit=50&days=7&urlversion=2&enhanced=0'
		);
		await $( 'ul.special' );

		// +1 for the initial item creation
		// +1 for the Main Page creation?
		// +1 for ?
		await expect( $$( 'ul.special li' ) ).resolves.toHaveLength( NUM_PROPERTIES + 3 );
	} );
} );
