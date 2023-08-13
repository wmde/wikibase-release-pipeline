/* eslint camelcase: ["error", {properties: "never"}] */
/**
 * See also: http://webdriver.io/guide/testrunner/configurationfile.html
 */

'use strict';

const fs = require( 'fs' );
const	saveScreenshot = require( 'wdio-mediawiki' ).saveScreenshot;
const JsonReporter = require( './json-reporter.js' );
const defaultFunctions = require( './helpers/default-functions.js' );
const WikibaseApi = require( 'wdio-wikibase/wikibase.api' );

const logPath = process.env.LOG_DIR || `${__dirname}/log/${process.env.SUITE}`;
const screenshotPath = `${logPath}/screenshots`;
const resultFilePath = `${logPath}/result.json`;

exports.logPath = logPath;
exports.screenshotPath = screenshotPath;
exports.resultFilePath = resultFilePath;

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
	logLevel: process.env.SELENIUM_LOG_LEVEL || 'error',

	// Setting this enables automatic screenshots for when a browser command fails	assertions.
	screenshotPath,

	// Default timeout for each waitFor* command.
	waitforTimeout: 30 * 1000,

	// See also: http://webdriver.io/guide/testrunner/reporters.html
	reporters: [
		[
			'spec', {
				showPreface: false,
				// Only available after we're on the v8 version of this plugin.
				// Once we're there this may do something we don't want, but
				// keeping here to remind us to consider the possibility of silencing
				// the "[0-0] RUNNING in chrome..." logging and just relying spec reporter.
				// realtimeReporting: true
			}
		],
		[
			JsonReporter, {
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

	suites: {

		// example-specs
		example: [
			'./specs/quickstatements/*.js',
			'./specs/repo/queryservice.js',
			'./specs/elasticsearch/*.js'
		],

		// bundle-specs
		repo: [ './specs/repo/*.js', './specs/repo/extensions/*.js' ],
		repo_client: [ './specs/repo_client/*.js', './specs/repo_client/extensions/*.js' ],
		fedprops: [ './specs/fedprops/*.js' ],
		pingback: [ './specs/pingback/*.js' ],

		quickstatements: [
			'./specs/repo_client/interwiki-links.js',
			'./specs/quickstatements/*.js'
		],

		elasticsearch: [ './specs/elasticsearch/*.js' ],
		confirm_edit: [ './specs/confirm_edit/*.js' ],

		// base-specs
		base__repo: [
			'./specs/repo/api.js',
			'./specs/repo/property.js',
			'./specs/repo/special-item.js',
			'./specs/repo/special-property.js',
			'./specs/repo/queryservice.js'
		],
		base__repo_client: [
			'./specs/repo_client/interwiki-links.js',
			'./specs/repo_client/item.js',
			'./specs/repo/api.js'
		],
		base__fedprops: [
			'./specs/fedprops/*.js'
		],
		base__pingback: [
			'./specs/pingback/*.js'
		],

		pre_upgrade: [
			'./specs/repo/api.js',
			'./specs/upgrade/pre-upgrade.js',
			'./specs/upgrade/queryservice-pre-and-post-upgrade.js'
		],

		post_upgrade: [
			'./specs/repo/api.js',
			'./specs/upgrade/post-upgrade.js',
			'./specs/upgrade/queryservice-pre-and-post-upgrade.js',
			'./specs/upgrade/queryservice-post-upgrade.js'
		]

	},

	// =====
	// Hooks
	// =====

	/**
	 * Remove screenshots and result.json from previous runs before any tests start running
	 */
	onPrepare: function () {		
		fs.mkdir(logPath, { recursive: true }, () => {});
		fs.rmdir(screenshotPath, { recursive: true, force: true }, () => {});
		fs.rm(resultFilePath, { force: true }, () => {});
	},

	/**
	 * Initializes the default functions for every test and
	 * polls the wikibase docker container for installed extensions
	 */
	before: function () {
		browser.call( () => WikibaseApi.initialize() );
		defaultFunctions.init();

		if ( !browser.config.installed_extensions ) {
			const extensions = browser.getInstalledExtensions( process.env.MW_SERVER );
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
