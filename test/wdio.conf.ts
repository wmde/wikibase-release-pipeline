/* eslint camelcase: ["error", {properties: "never"}] */
/**
 * See also: http://webdriver.io/guide/testrunner/configurationfile.html
 */

import { Frameworks, Options } from '@wdio/types';
import { existsSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import WikibaseApi from 'wdio-wikibase/wikibase.api.js';
import { defaultFunctions as defaultFunctionsInit } from './helpers/default-functions.js';
import JsonReporter from './helpers/json-reporter.js';
import { TestSetup } from './helpers/TestSetup.js';
import { saveScreenshot } from 'wdio-mediawiki';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function wdioConfig( testSetup: TestSetup, specs: string[] ): WebdriverIO.Config {
	return {
		specs: specs.map( specFilepath => `${__dirname}/${specFilepath}` ),

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
				}
			],
			[
				JsonReporter,
				{
					resultFilePath: testSetup.resultFilePath
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
		onPrepare: async function () {
			await testSetup.execute();
		},

		/**
		 * Initializes the default functions for every test and
		 * polls the wikibase docker container for installed extensions
		 */
		before: async () => {
			defaultFunctionsInit();

			await WikibaseApi.initialize(
				undefined,
				process.env.MW_ADMIN_NAME,
				process.env.MW_ADMIN_PASS
			);
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
				saveScreenshot( screenshotFilename, testSetup.screenshotPath );
			} catch ( error ) {
				console.error( 'failed writing screenshot ...' );
				console.error( error );
			}
		}
	};
}
