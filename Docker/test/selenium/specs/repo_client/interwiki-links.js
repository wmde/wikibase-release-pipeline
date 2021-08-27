'use strict';

const fs = require( 'fs' );
const assert = require( 'assert' );

describe( 'Interwiki links', function () {

	it( 'Should be able to insert interwiki links', function () {
		const repoLink = fs.readFileSync( 'data/interwiki-link.sql', 'utf8' )
			.replace( /<WIKI_ID>/g, 'client_wiki' )
			.replace( /<HOSTNAME>/g, process.env.MW_CLIENT_SERVER );
		browser.dbQuery( repoLink );
		assert(
			browser.dbQuery( 'SELECT iw_url FROM interwiki WHERE iw_prefix = "client_wiki"' )
				.indexOf( process.env.MW_CLIENT_SERVER ) > -1
		);

		const config = {
			user: process.env.DB_USER,
			pass: process.env.DB_PASS,
			database: 'client_wiki'
		};
		const clientLink = fs.readFileSync( 'data/interwiki-link.sql', 'utf8' )
			.replace( /<WIKI_ID>/g, 'my_wiki' )
			.replace( /<HOSTNAME>/g, process.env.MW_SERVER );

		browser.dbQuery( clientLink, config );
		assert(
			browser.dbQuery( 'SELECT iw_url FROM interwiki WHERE iw_prefix = "my_wiki"', config )
				.indexOf( process.env.MW_SERVER ) > -1
		);
	} );
} );
