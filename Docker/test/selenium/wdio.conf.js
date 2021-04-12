/* eslint camelcase: ["error", {properties: "never"}] */
/**
 * See also: http://webdriver.io/guide/testrunner/configurationfile.html
 */

'use strict';

const fs = require( 'fs' ),
	saveScreenshot = require( 'wdio-mediawiki' ).saveScreenshot;

const JsonReporter = require( './json-reporter.js' );

exports.config = {

	// ======
	// Custom WDIO config specific to MediaWiki
	// ======
	// Use in a test as `browser.options.<key>`.

	// Wiki admin
	mwUser: process.env.MW_ADMIN_NAME,
	mwPwd: process.env.MW_ADMIN_PASS,

	// Base for browser.url() and Page#openTitle()
	baseUrl: process.env.MW_SERVER + process.env.MW_SCRIPT_PATH,

	// ============
	// Capabilities
	// ============
	capabilities: [ {
		// https://sites.google.com/a/chromium.org/chromedriver/capabilities
		browserName: 'chrome',
		maxInstances: 1,
		'goog:chromeOptions': {
			// If DISPLAY is set, assume developer asked non-headless or CI with Xvfb.
			// Otherwise, use --headless (added in Chrome 59)
			// https://chromium.googlesource.com/chromium/src/+/59.0.3030.0/headless/README.md
			args: [
				...( process.env.DISPLAY ? [] : [ '--headless' ] ),
				// Chrome sandbox does not work in Docker
				...( fs.existsSync( '/.dockerenv' ) ? [ '--no-sandbox' ] : [] )
			]
		}
	} ],

	// ===================
	// Test Configurations
	// ===================

	// Level of verbosity: "trace", "debug", "info", "warn", "error", "silent"
	logLevel: process.env.SELENIUM_LOG_LEVEL || 'warn',

	// Setting this enables automatic screenshots for when a browser command fails
	// It is also used by afterTest for capturig failed assertions.
	screenshotPath: process.env.LOG_DIR || __dirname + '/log',

	// Default timeout for each waitFor* command.
	waitforTimeout: 30 * 1000,

	// See also: http://webdriver.io/guide/testrunner/reporters.html
	reporters: [
		'spec',
		[ JsonReporter, {} ]
	],

	// See also: http://mochajs.org
	mochaOpts: {
		ui: 'bdd',
		timeout: 90 * 1000
	},

	// define all tests
	specs: [ './specs/**/*.js' ],

	suites: {

		// bundle-specs
		repo: [ './specs/repo/*.js' ],
		repo_client: [ './specs/repo_client/*.js' ],
		fedprops: [ './specs/fedprops/*.js' ],
		pingback: [ './specs/pingback/*.js' ],

		quickstatements: [ './specs/quickstatements/*.js' ],
		elasticsearch: [ './specs/elasticsearch/*.js' ],
		confirm_edit: [ './specs/confirm_edit/*.js' ],

		// base-specs
		base__repo: [
			'./specs/repo/property.js',
			'./specs/repo/special-property.js',
			'./specs/repo/queryservice.js'
		],
		base__repo_client: [
			'./specs/repo_client/interwiki-links.js',
			'./specs/repo_client/item.js'
		],
		base__fedprops: [
			'./specs/fedprops/*.js'
		],
		base__pingback: [
			'./specs/pingback/*.js'
		]

	},

	// =====
	// Hooks
	// =====

	/**
	 * Save a screenshot when test fails.
	 *
	 * @param {Object} test Mocha Test object
	 */
	afterTest: function ( test ) {
		const screenshotPath = browser.config.screenshotPath;
		const folder = ( process.env.DATABASE_IMAGE_NAME + '-' + process.env.SUITE ).replace( /[^a-zA-Z_0-9]/g, '_' );
		browser.config.screenshotPath = screenshotPath + '/' + folder;
		try {
			saveScreenshot( test.title );
		} catch ( error ) {
			console.error( 'failed writing screenshot ...' );
			console.error( error );
		}
		browser.config.screenshotPath = screenshotPath;
	}
};
