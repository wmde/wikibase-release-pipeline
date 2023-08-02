'use strict';

const Page = require( '../page' );

class Property extends Page {

	get save() { return $( '=save' ); }
	get addStatement() { return $( '=add statement' ); }
	get addReference() { return $( '=add reference' ); }

	open( id ) {
		browser.url( process.env.WIKIBASE_PUBLIC_URL + '/wiki/Property:' + id );
	}
}

module.exports = new Property();
