'use strict';

const axios = require( 'axios' );
const assert = require( 'assert' );
const _ = require( 'lodash' );

const defaultFunctions = function () {

	/**
	 * Make a get request to get full request response
	 */
	browser.addCommand( 'makeRequest', function async( url ) {
		return axios.get( url );
	} );

	/**
	 * Creates or edits a page with content
	 */
	browser.addCommand( 'editPage', function editPage( host, title, content ) {
		browser.url( host + '/wiki/' + title + '?action=edit' );
		$( '#wpTextbox1' ).waitForDisplayed();
		$( '#wpTextbox1' ).setValue( content );
		$( '#wpSave' ).click();
		browser.pause( 1 * 1000 );
		$( '#bodyContent' ).waitForDisplayed();
		return $( '#bodyContent' ).getText();
	} );

	/**
	 * Moves browser to recent changes then asserts that a change is in the api result
	 */
	browser.addCommand( 'assertChangeDispatched', function async( host, expectedChange ) {
		// to get a screenshot
		browser.url( host + '/wiki/Special:RecentChanges?limit=50&days=7&urlversion=2' );

		// get all external changes
		const apiURL = host + '/w/api.php?format=json&action=query&list=recentchanges&rctype=external&rcprop=comment|title';
		const result = browser.makeRequest( apiURL );
		const changes = result.data.query.recentchanges;

		assert( result.status === 200 );

		assert( _.find( changes, expectedChange ) );
	} );

	/**
	 * Moves browser to recent changes then asserts that a change is in the api result
	 */
	browser.addCommand( 'getLuaCpuTime', function async( host, page ) {
		const response = browser.makeRequest( host + '/wiki/' + page );

		const cpuMatches = response.data.match( /(CPU time usage:) ([-.0-9]+) (\w+)/ );
		const cpuTime = parseFloat( cpuMatches[ 2 ] );
		const cpuTimeScale = cpuMatches[ 3 ];

		return { value: cpuTime, scale: cpuTimeScale };
	} );

};

module.exports = defaultFunctions;
