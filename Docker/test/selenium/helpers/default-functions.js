'use strict';

const axios = require( 'axios' );
const assert = require( 'assert' );
const exec = require( 'child_process' ).exec;
const _ = require( 'lodash' );

const defaultFunctions = function () {

	/**
	 * Make a get request to get full request response
	 */
	browser.addCommand( 'makeRequest', function async( url ) {
		return axios.get( url );
	} );

	/**
	 * Execute query on database
	 */
	browser.addCommand( 'dbQuery', function async( query, config ) {
		if ( !config ) {
			config = {
				user: process.env.DB_USER,
				pass: process.env.DB_PASS,
				database: process.env.DB_NAME
			};
		}

		return browser.dockerExecute(
			process.env.DOCKER_MYSQL_NAME,
			'mysql --user "' + config.user + '"' +
			' --password="' + config.pass + '" "' + config.database + '"' +
			" -e '" + query + "'"
		);
	} );

	/**
	 * Execute docker command on container and get output
	 */
	browser.addCommand( 'dockerExecute', function async( container, command, opts ) {

		if ( !opts ) {
			opts = '';
		}

		const fullCommand = 'docker exec ' + opts + ' ' + container + ' ' + command;
		console.log( 'executing: ' + fullCommand );

		return new Promise( ( resolve ) => {
			exec( fullCommand, ( error, stdout, stderr ) => {

				if ( error ) {
					console.warn( error );
				}

				resolve( stdout || stderr );
			} );
		} );
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
	browser.addCommand( 'getDispatchedExternalChange', function async( host, expectedChange ) {
		// to get a screenshot
		browser.url( host + '/wiki/Special:RecentChanges?limit=50&days=7&urlversion=2' );

		// get all external changes
		const apiURL = host + '/w/api.php?format=json&action=query&list=recentchanges&rctype=external&rcprop=comment|title';
		const result = browser.makeRequest( apiURL );
		const changes = result.data.query.recentchanges;
		const foundResult = _.find( changes, expectedChange );

		assert( result.status === 200 );

		if ( !foundResult ) {
			console.error( 'Could not find:' );
			console.log( expectedChange );
			console.error( 'Response: ' );
			console.log( changes );
		}

		return foundResult;
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
