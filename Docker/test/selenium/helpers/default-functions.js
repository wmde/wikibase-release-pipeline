'use strict';

const axios = require( 'axios' );
const assert = require( 'assert' );
const exec = require( 'child_process' ).exec;
const _ = require( 'lodash' );
const MWBot = require( 'mwbot' );

const defaultFunctions = function () {

	/**
	 * Make a get request to get full request response
	 */
	browser.addCommand( 'makeRequest', function async( url, params, postData ) {
		if ( postData ) {
			return axios.post( url, postData, params );
		} else {
			return axios.get( url, params );
		}
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
	 * Delete a claim by guid or pipe-separated list of guids
	 */
	browser.addCommand( 'deleteClaim', function async( claimGuid ) {
		const bot = new MWBot( {
			apiUrl: `${browser.config.baseUrl}/api.php`
		} );

		return new Promise( ( resolve ) => {
			bot.getEditToken()
				.then( () => {
					bot.request( {
						action: 'wbremoveclaims',
						claim: claimGuid,
						token: bot.editToken
					} ).then( ( response ) => {
						resolve( response );
					} );
				} );
		} );
	} );

	/**
	 * Execute docker command on container and get output
	 */
	browser.addCommand( 'dockerExecute', function async( container, command, opts, shouldLog ) {

		if ( !opts ) {
			opts = '';
		}

		const fullCommand = 'docker exec ' + opts + ' ' + container + ' ' + command;
		if ( shouldLog ) {
			console.log( 'executing: ' + fullCommand );
		}

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
	browser.addCommand( 'editPage', function editPage( host, title, content, captcha ) {
		browser.url( host + '/wiki/' + title + '?action=edit' );

		// wait for javascript to settle
		browser.pause( 5 * 1000 );

		// this shows up one time for anonymous users (VisualEditor)
		const startEditbutton = $( '.oo-ui-messageDialog-actions .oo-ui-flaggedElement-progressive' );
		if ( startEditbutton.elementId ) {
			startEditbutton.click();
		}

		// fill out form
		$( '#wpTextbox1' ).waitForDisplayed();
		$( '#wpTextbox1' ).setValue( content );

		if ( captcha ) {
			$( '#wpCaptchaWord' ).setValue( captcha );
		}

		// save page
		browser.execute( function () {
			$( '#editform.mw-editform' ).submit();
		}, this );

		browser.pause( 2 * 1000 );

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
	 * Makes a request to a page and returns the lua cpu profiling data
	 */
	browser.addCommand( 'getLuaCpuTime', function async( host, page ) {
		const response = browser.makeRequest( host + '/wiki/' + page );

		const cpuMatches = response.data.match( /(CPU time usage:) ([-.0-9]+) (\w+)/ );
		const cpuTime = parseFloat( cpuMatches[ 2 ] );
		const cpuTimeScale = cpuMatches[ 3 ];

		return { value: cpuTime, scale: cpuTimeScale };
	} );

	/**
	 * Execute quickstatements query
	 */
	browser.addCommand( 'executeQuickStatement', function async( theQuery ) {

		browser.url( process.env.QS_SERVER + '/#/batch' );

		// create a batch
		$( '.create_batch_box textarea' ).waitForDisplayed();
		$( '.create_batch_box textarea' ).setValue( theQuery );

		browser.pause( 1000 );

		// click import
		$( "button[tt='dialog_import_v1']" ).click();

		browser.pause( 1000 );

		// click run
		$( "button[tt='run']" ).waitForDisplayed();
		$( "button[tt='run']" ).click();
		console.log( 'executing quickstatements query: ' + theQuery );

		const commands = $$( '.command_status' );

		browser.waitUntil(
			() => _.every( commands, function ( command ) { return command.getText() === 'done'; } ),
			{
				timeout: 10000,
				timeoutMsg: 'Expected to be done after 10 seconds'
			}
		);

		console.log( 'quickstatements query complete: ' + theQuery );

	} );

};

module.exports = {
	init: defaultFunctions,
	skipIfExtensionNotPresent: function ( test, extension ) {
		const installedExtensions = browser.config.installed_extensions;
		if ( !installedExtensions || installedExtensions.length === 0 ) {
			return;
		} else if ( installedExtensions && installedExtensions.includes( 'Wikibase' ) && installedExtensions.includes( extension ) ) {
			return;
		} else {
			test.skip();
		}
	}
};
