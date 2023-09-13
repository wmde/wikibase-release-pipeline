/* eslint camelcase: ["error", {properties: "never"}] */
/**
 * See also: http://webdriver.io/guide/testrunner/configurationfile.html
 */

'use strict';

const fs = require( 'fs' );
const path = require( 'path' );
const saveScreenshot = require( 'wdio-mediawiki' ).saveScreenshot;
const JsonReporter = require( '../helpers/json-reporter.js' );
const defaultFunctions = require( '../helpers/default-functions.js' );
const WikibaseApi = require( 'wdio-wikibase/wikibase.api' );

const resultsDir = process.env.RESULTS_DIR;
const screenshotPath = `${resultsDir}/screenshots`;
const resultFilePath = `${resultsDir}/result.json`;

exports.screenshotPath = screenshotPath;
exports.resultFilePath = resultFilePath;

const fetchSuite = ( suiteName ) => {
	if ( fs.lstatSync( path.join( __dirname, suiteName ) ).isDirectory() ) {
		const suiteConfigFile = path.join(
			__dirname,
			suiteName,
			`${suiteName}.conf.js`
		);
		try {
			const suiteConfig = require( suiteConfigFile );
			return suiteConfig.config.suite;
		} catch {}
	}
	return undefined;
};

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

	hostname: 'browser',
	port: 4444,
	path: '/wd/hub',
	// ============
	// Capabilities
	// ============
	// https://sites.google.com/a/chromium.org/chromedriver/capabilities
	capabilities: [
		{
			browserName: 'chrome',
			maxInstances: 1,
			'goog:chromeOptions': {
				args: [
					// The window size is relevant for responsive pages rendering differently on
					// different screen sizes. Bootstrap considers widths between 1200 and 1400
					// as XL, let's use that.
					// https://getbootstrap.com/docs/5.0/layout/breakpoints/#available-breakpoints
					...[ '--window-size=1280,800' ],
					...( process.env.HEADED_TESTS ? [] : [ '--headless' ] ),
					// Chrome sandbox does not work in Docker
					...( fs.existsSync( '/.dockerenv' ) ? [ '--no-sandbox' ] : [] )
				]
			}
		}
	],

	// ===================
	// Test Configurations
	// ===================

	// Level of verbosity: "trace", "debug", "info", "warn", "error", "silent"
	logLevel: process.env.SELENIUM_LOG_LEVEL || 'error',

	// Setting this enables automatic screenshots for when a browser command fails assertions.
	screenshotPath,

	// Default timeout for each waitFor* command.
	waitforTimeout: 30 * 1000,

	// See also: http://webdriver.io/guide/testrunner/reporters.html
	reporters: [
		[
			'spec',
			{
				showPreface: false
				// Only available after we're on the v8 version of this plugin.
				// Once we're there this may do something we don't want, but
				// keeping here to remind us to consider the possibility of silencing
				// the "[0-0] RUNNING in chrome..." logging and just relying spec reporter.
				// realtimeReporting: true
			}
		],
		[
			JsonReporter,
			{
				resultFilePath
			}
		]
	],

	// See also: http://mochajs.org
	mochaOpts: {
		ui: 'bdd',
		timeout: process.env.MOCHA_OPTS_TIMEOUT || 90 * 1000
	},

	// define all tests
	specs: [ './specs/**/*.js' ],

	suites: { [ process.env.SUITE ]: fetchSuite( process.env.SUITE ) },

	// =====
	// Hooks
	// =====

	/**
	 * Remove screenshots and result.json from previous runs before any tests start running
	 */
	onPrepare: function () {
		// NOTE: This log/result directory setup is already handled in the shellscript before
		// WDIO is ran (e.g. scripts/test_suite.sh. It may be preferable to handle here in
		// the future. These operations are harmless as-is.
		fs.mkdir( resultsDir, { recursive: true }, () => {} );
		fs.rm( screenshotPath, { recursive: true, force: true }, () => {} );
		fs.rm( resultFilePath, { force: true }, () => {} );
	},

	/**
	 * Initializes the default functions for every test and
	 * polls the wikibase docker container for installed extensions
	 */
	before: async () => {
		await WikibaseApi.initialize();
		defaultFunctions.init();

		if ( !browser.config.installed_extensions ) {
			const extensions = await browser.getInstalledExtensions(
				process.env.MW_SERVER
			);
			if ( extensions ) {
				browser.config.installed_extensions = extensions;
			} else {
				browser.config.installed_extensions = [];
			}
		}
	},

	/**
	 * Save a screenshot when test fails.
	 *
	 * @param {Object} test Mocha Test object
	 */
	afterTest: function ( test ) {
		const testFile = encodeURIComponent(
			test.file.match( /.+\/(.+)\.js$/ )[ 1 ].replace( /\s+/g, '-' )
		);
		const screenshotFilename = `${testFile}__${test.title}`;

		try {
			saveScreenshot( screenshotFilename );
		} catch ( error ) {
			console.error( 'failed writing screenshot ...' );
			console.error( error );
		}
	}
};
