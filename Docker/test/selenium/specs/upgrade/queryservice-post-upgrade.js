'use strict';

const _ = require( 'lodash' );
const WikibaseApi = require( 'wdio-wikibase/wikibase.api' );
const assert = require( 'assert' );

const getElementByURI = function ( uri, bindings ) {
	const index = _.findIndex( bindings, function ( binding ) {
		return binding.p.value === uri;
	} );
	return index === -1 ? [] : bindings[ index ];
};

const queryBlazeGraph = function ( itemId ) {
	const sparqlEndpoint = 'http://wdqs.svc:9999/bigdata/namespace/wdq/sparql';
	const params = {
		headers: { Accept: 'application/sparql-results+json' },
		validateStatus: false
	};

	// essentially 'SELECT * WHERE { <http://wikibase.svc/entity/Q101> ?p ?o }' but encoded
	const queryString = 'query=SELECT+*+WHERE%7B+%3Chttp%3A%2F%2Fwikibase.svc%2Fentity%2F' + itemId + '%3E+%3Fp+%3Fo+%7D';

	const response = browser.makeRequest( sparqlEndpoint, params, queryString );
	return response.data.results.bindings;
};

describe( 'Wikibase post upgrade', function () {

	const itemLabel = 'NewUpgradeItem';
	const propertyValue = 'NewUpgradeItemStringValue';
	let newItemId;
	let newPropertyId;
	let oldItemID;

	before( function () {
		if ( process.env.RUN_QUERYSERVICE_POST_UPGRADE_TEST !== 'true' ) {
			this.skip();
		}
	} );

	it( 'Should be able find the item after upgrade', function () {

		const result = browser.makeRequest(
			process.env.MW_SERVER + '/w/api.php?action=wbsearchentities&search=Q101&format=json&language=en&type=item'
		);
		const success = result.data.success;
		const searchResults = result.data.search;

		assert( success === 1 );
		assert( searchResults.length === 1 );
		assert( searchResults[ 0 ].match.text === 'Q101' );
		assert( searchResults[ 0 ].match.type === 'entityId' );

		oldItemID = searchResults[ 0 ].id;

		browser.url( process.env.MW_SERVER + '/wiki/Item:' + oldItemID );

	} );

	it( 'Should be able to create a new specific item', function () {

		newPropertyId = browser.call( () => WikibaseApi.createProperty( 'string' ) );
		const data = {
			claims: [
				{
					mainsnak: {
						snaktype: 'value',
						property: newPropertyId,
						datavalue: { value: propertyValue, type: 'string' } },
					type: 'statement', rank: 'normal'
				}
			]
		};

		newItemId = browser.call(
			() => WikibaseApi.createItem( itemLabel, data )
		);

		assert( newItemId.startsWith( 'Q' ) === true );
		assert( newPropertyId.startsWith( 'P' ) === true );

	} );

	it( 'Old item should show up in Queryservice', function () {

		const bindings = queryBlazeGraph( oldItemID );

		assert( bindings.length === 9 );

		const statement = getElementByURI( process.env.MW_SERVER + '/prop/P101', bindings );
		const property = getElementByURI( process.env.MW_SERVER + '/prop/direct/P101', bindings );

		const itemLabelValue = getElementByURI( 'http://www.w3.org/2000/01/rdf-schema#label', bindings );

		const dateModified = getElementByURI( 'http://schema.org/dateModified', bindings );
		const schemaVersion = getElementByURI( 'http://schema.org/version', bindings );
		const siteLinks = getElementByURI( 'http://wikiba.se/ontology#sitelinks', bindings );
		const identifiers = getElementByURI( 'http://wikiba.se/ontology#identifiers', bindings );
		const timestamp = getElementByURI( 'http://wikiba.se/ontology#timestamp', bindings );

		assert( dateModified !== null );
		assert( schemaVersion !== null );
		assert( siteLinks !== null );
		assert( identifiers !== null );
		assert( timestamp !== null );
		assert( statement !== null );

		assert( property.o.value === 'UpgradeItemStringValue' );
		assert( itemLabelValue.o.value === 'UpgradeItem' );

	} );

	it( 'New item should show up in Queryservice', function () {

		browser.pause( 15 * 1000 );
		const bindings = queryBlazeGraph( newItemId );

		assert( bindings.length === 9 );

		const statement = getElementByURI( process.env.MW_SERVER + '/prop/' + newPropertyId, bindings );
		const property = getElementByURI( process.env.MW_SERVER + '/prop/direct/' + newPropertyId, bindings );

		const itemLabelValue = getElementByURI( 'http://www.w3.org/2000/01/rdf-schema#label', bindings );
		const dateModified = getElementByURI( 'http://schema.org/dateModified', bindings );
		const schemaVersion = getElementByURI( 'http://schema.org/version', bindings );
		const siteLinks = getElementByURI( 'http://wikiba.se/ontology#sitelinks', bindings );
		const identifiers = getElementByURI( 'http://wikiba.se/ontology#identifiers', bindings );
		const timestamp = getElementByURI( 'http://wikiba.se/ontology#timestamp', bindings );

		assert( dateModified !== null );
		assert( schemaVersion !== null );
		assert( siteLinks !== null );
		assert( identifiers !== null );
		assert( timestamp !== null );
		assert( statement !== null );

		assert( property.o.value === propertyValue );
		assert( itemLabelValue.o.value === itemLabel );

	} );

} );
