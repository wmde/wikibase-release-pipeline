/* eslint-disable node/no-deprecated-api */
'use strict';

const http = require( 'http' );
const url = require( 'url' );

console.log( 'beacon started!' );

const messages = [];

http.createServer( function ( req, res ) {
	// TODO: 'url.parse' was deprecated since v11.0.0. Use 'url.URL'
	// constructor instead (then re-enable linting rule above)
	const queryObject = url.parse( req.url, true ).query;
	messages.push( queryObject );

	console.log( 'beacon got: ' + JSON.stringify( queryObject ) );

	res.setHeader( 'Content-Type', 'application/json' );
	res.write( JSON.stringify( messages ) );

	res.end();
} ).listen( 80 );
