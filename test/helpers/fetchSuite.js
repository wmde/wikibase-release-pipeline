'use strict';

const fs = require( 'fs' );
const path = require( 'path' );

const fetchSuite = ( suiteName ) => {
	const suitePath = path.join( __dirname, 'suites', suiteName );
	if ( fs.lstatSync( suitePath ).isDirectory() ) {
		const suiteConfigFile = path.join( suitePath, `${suiteName}.conf.js` );
		try {
			const suiteConfig = require( suiteConfigFile );
			return suiteConfig.config.suite;
		} catch {
			console.error( 'Could not read config at ', suiteConfigFile );
		}
	} else {
		console.error( 'No directory found at ', suitePath );
	}
	return undefined;
};

module.exports = fetchSuite;
