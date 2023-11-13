/* eslint camelcase: ["error", {properties: "never"}] */
/**
 * See also: http://webdriver.io/guide/testrunner/configurationfile.html
 */

import { Frameworks, Options } from '@wdio/types';
import { existsSync, mkdir, rm } from 'fs';
import { saveScreenshot } from 'wdio-mediawiki';
import WikibaseApi from 'wdio-wikibase/wikibase.api.js';
import { defaultFunctions as defaultFunctionsInit } from './helpers/default-functions.js';
import JsonReporter from './helpers/json-reporter.js';

const resultsDir = process.env.RESULTS_DIR;
const screenshotPath = `${resultsDir}/screenshots`;
const resultFilePath = `${resultsDir}/result.json`;

export const config: WebdriverIO.Config = {
	// ======
	// Custom WDIO config specific to MediaWiki
	// ======
	// Use in a test as `browser.options.<key>`.

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
					...( existsSync( '/.dockerenv' ) ? [ '--no-sandbox' ] : [] )
				]
			}
		}
	],

	// ===================
	// Test Configurations
	// ===================

	// Level of verbosity: "trace", "debug", "info", "warn", "error", "silent"
	logLevel:
		( process.env.SELENIUM_LOG_LEVEL as Options.WebDriverLogTypes ) || 'error',

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
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		mkdir( resultsDir, { recursive: true }, () => {} );
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		rm( screenshotPath, { recursive: true, force: true }, () => {} );
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		rm( resultFilePath, { force: true }, () => {} );
	},

	/**
	 * Initializes the default functions for every test and
	 * polls the wikibase docker container for installed extensions
	 */
	before: async () => {
		await WikibaseApi.initialize(
			undefined,
			process.env.MW_ADMIN_NAME,
			process.env.MW_ADMIN_PASS
		);
		defaultFunctionsInit();
	},

	/**
	 * Save a screenshot when test fails.
	 *
	 * @param {Frameworks.Test} test
	 */
	afterTest: function ( test: Frameworks.Test ) {
		const testFile = encodeURIComponent(
			test.file.match( /.+\/(.+)\.[jt]s$/ )[ 1 ].replace( /\s+/g, '-' )
		);
		const screenshotFilename = `${testFile}__${test.title}`;

		try {
			saveScreenshot( screenshotFilename, screenshotPath );
		} catch ( error ) {
			console.error( 'failed writing screenshot ...' );
			console.error( error );
		}
	}
};
