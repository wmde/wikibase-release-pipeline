/* eslint camelcase: ["error", {properties: "never"}] */
/**
 * See also: http://webdriver.io/guide/testrunner/configurationfile.html
 */

import { Options } from '@wdio/types';
import { existsSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import type { Capabilities } from '@wdio/types';
import JsonReporter from '../helpers/json-reporter.js';
import TestEnvironment from './TestEnvironment.js';

// eslint-disable-next-line no-underscore-dangle
const __dirname = dirname( fileURLToPath( import.meta.url ) );

export function wdioConfig( testEnv: TestEnvironment ): WebdriverIO.Config {
	const settings = testEnv.settings;

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
				maxInstances: settings.maxInstances,
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

		onPrepare: async () => {
			if ( settings.onPrepare ) {
				await settings.onPrepare( testEnv );
			}
		},

		before: async () => {
			if ( settings.before ) {
				await settings.before( testEnv );
			}
		},

		beforeSuite: async ( mochaSuite ) => {
			testEnv.testLog.info( `📘 ${mochaSuite.title.toUpperCase()}` );
			if ( settings.beforeMochaSuite ) {
				await settings.beforeMochaSuite( mochaSuite, testEnv );
			}
		},

		beforeTest: async function ( mochaTest ) {
			testEnv.testLog.info( `▶️ SPEC: ${mochaTest.title.toUpperCase()}` );
			if ( settings.beforeTest ) {
				await settings.beforeTest( mochaTest, testEnv );
			}
		},

		afterTest: async function ( mochaTest ) {
			if ( settings.afterTest ) {
				await settings.afterTest( mochaTest, testEnv );
			}
		},

		afterSuite: async ( mochaSuite ) => {
			if ( settings.afterMochaSuite ) {
				await settings.afterMochaSuite( mochaSuite, testEnv );
			}
		},

		after: async () => {
			if ( settings.after ) {
				await settings.after( testEnv );
			}
		},

		onComplete: async () => {
			if ( settings.onComplete ) {
				await settings.onComplete( testEnv );
			}
		}
	};
}

export default wdioConfig;
