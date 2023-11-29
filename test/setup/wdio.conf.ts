/* eslint camelcase: ["error", {properties: "never"}] */
/**
 * See also: http://webdriver.io/guide/testrunner/configurationfile.html
 */

import { Frameworks, Options } from '@wdio/types';
import { existsSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import type { Capabilities } from '@wdio/types';
import JsonReporter from '../helpers/json-reporter.js';
import { TestSettings } from './TestConfig.js';
import { TestEnvironment } from './TestEnvironment.js';
import testLog from './testLog.js';
import { saveScreenshot } from 'wdio-mediawiki';

// eslint-disable-next-line no-underscore-dangle
const __dirname = dirname( fileURLToPath( import.meta.url ) );

export function wdioConfig(
	settings: TestSettings,
	environment: TestEnvironment
): WebdriverIO.Config {
	return {
		specs: settings.specs.map( ( specFilepath ) => `${__dirname}/../${specFilepath}` ),

		// ======
		// Custom WDIO config specific to MediaWiki
		// ======
		// Use in a test as `browser.options.<key>`.

		// Base for browser.url() and Page#openTitle()
		baseUrl: settings.baseUrl,

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
						...( settings.runHeaded ? [] : [ '--headless' ] ),
						// Chrome sandbox does not work in Docker
						...( existsSync( '/.dockerenv' ) ? [ '--no-sandbox' ] : [] )
					]
				}
			} as Capabilities.ChromeCapabilities
		],

		// ===================
		// Test Configurations
		// ===================

		// Level of verbosity: "trace", "debug", "info", "warn", "error", "silent"
		logLevel: settings.logLevel as Options.WebDriverLogTypes,

		outputDir: settings.outputDir,

		// Default timeout for each waitFor* command.
		waitforTimeout: settings.waitForTimeout as number,

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
					suiteName: settings.name,
					resultFilePath: settings.resultFilePath
				}
			]
		],

		// See also: http://mochajs.org
		mochaOpts: {
			ui: 'bdd',
			timeout: settings.testTimeout
		},

		// =====
		// Hooks
		// =====
		onPrepare: async () => environment.up(),

		/**
		 * Initializes the default functions for every test and
		 * polls the wikibase docker container for installed extensions
		 *
		 * @param {...any} args
		 */
		before: async () => settings.before( settings ),

		beforeSuite: async ( suite ) => {
			testLog.info( `📘 ${suite.title.toUpperCase()}` );
		},

		beforeTest: function ( test ) {
			testLog.info( `▶️ SPEC: ${test.title.toUpperCase()}` );
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
				saveScreenshot( screenshotFilename, settings.screenshotPath );
			} catch ( error ) {
				console.error( 'failed writing screenshot ...' );
				console.error( error );
			}
		},

		onComplete: () => environment.down()
	};
}
