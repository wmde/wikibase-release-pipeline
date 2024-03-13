import { getTestString } from 'wdio-mediawiki/Util.js';
import WikibaseApi from 'wdio-wikibase/wikibase.api.js';
import { wikibasePropertyString } from '../../helpers/wikibase-property-types.js';
import WikibasePropertyType from '../../types/wikibase-property-type.js';

const dataTypes = [ wikibasePropertyString ];

describe( 'Wikibase API', function () {
	// eslint-disable-next-line mocha/no-setup-in-describe
	dataTypes.forEach( ( dataType: WikibasePropertyType ) => {
		it( `Should be able to create many properties and items of type ${ dataType.name }`, async function () {
			Array( 100 ).forEach( async () => {
				const itemLabel = 'T267743-';
				const propertyValue = `PropertyExample${ dataType.name }Value`;
				const propertyId = await WikibaseApi.createProperty( dataType.urlName );
				const data = {
					claims: [
						{
							mainsnak: {
								snaktype: 'value',
								property: propertyId,
								datavalue: { value: propertyValue, type: dataType.urlName }
							},
							type: 'statement',
							rank: 'normal'
						}
					]
				};

				const itemId = await WikibaseApi.createItem(
					getTestString( itemLabel ),
					data
				);

				expect( itemId.startsWith( 'Q' ) ).toBe( true );
				expect( propertyId.startsWith( 'P' ) ).toBe( true );
			} );
		} );
	} );
} );
