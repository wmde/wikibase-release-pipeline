import { SevereServiceError } from 'webdriverio';
import { Frameworks } from '@wdio/types';
import WikibaseApi from 'wdio-wikibase/wikibase.api.js';
import { defaultFunctions as defaultFunctionsInit } from '../helpers/default-functions.js';
import loadEnvFiles from './loadEnvFiles.js';
import loadLocalDockerImage from './loadLocalDockerImage.js';
import { saveScreenshot } from 'wdio-mediawiki';
import TestSettings, {
	TestEnvSettings,
	TestHooks,
	TestRunnerSettings,
	TestSuiteSettings
} from '../types/TestSettings.js';

export const ONE_DAY_IN_MS = 86400000;

export const defaultTestSettings = {
	envFiles: [
		'../variables.env',
		'./test-services.env',
		'../local.env'
	],
	composeFiles: [
		'suites/docker-compose.yml'
	],
	waitForUrls: (): string[] => {
		return ( [
			`${testEnv.vars.WIKIBASE_URL}/wiki/Main_Page`,
			`${testEnv.vars.WDQS_URL}/bigdata/namespace/wdq/sparql`,
			testEnv.vars.WDQS_FRONTEND_URL
		] );
	},
	onPrepare: async (): Promise<void> => {
		await testEnv.up();
	},
	beforeServices: async (): Promise<void> => {
		testEnv.vars.WIKIBASE_TEST_IMAGE_URL = testEnv.settings.isBaseSuite ?
			testEnv.vars.WIKIBASE_SUITE_WIKIBASE_IMAGE_URL :
			testEnv.vars.WIKIBASE_SUITE_WIKIBASE_BUNDLE_IMAGE_URL;
		const defaultImageUrls = [
			testEnv.vars.WIKIBASE_TEST_IMAGE_URL,
			testEnv.vars.WIKIBASE_SUITE_WDQS_IMAGE_URL,
			testEnv.vars.WIKIBASE_SUITE_WDQS_FRONTEND_IMAGE_URL,
			testEnv.vars.WIKIBASE_SUITE_WDQS_PROXY_IMAGE_URL
		];
		const extraImageUrls = [
			testEnv.vars.WIKIBASE_SUITE_ELASTICSEARCH_IMAGE_URL,
			testEnv.vars.WIKIBASE_SUITE_QUICKSTATEMENTS_IMAGE_URL
		];
		defaultImageUrls.forEach( ( defaultImageUrl ) =>
			loadLocalDockerImage( defaultImageUrl as string ) );
		if ( !testEnv.settings.isBaseSuite ) {
			extraImageUrls.forEach( ( extraImageUrl ) =>
				loadLocalDockerImage( extraImageUrl as string )
			);
		}
	},
	before: async (): Promise<void> => {
		try {
			defaultFunctionsInit();
			await WikibaseApi.initialize(
				undefined,
				testEnv.vars.MW_ADMIN_NAME,
				testEnv.vars.MW_ADMIN_PASS
			);
		} catch ( e ) {
			throw new SevereServiceError( e );
		}
	},
	afterTest: async ( mochaTest: Frameworks.Test ): Promise<void> => {
		const testFile = encodeURIComponent(
			mochaTest.file.match( /.+\/(.+)\.[jt]s$/ )[ 1 ].replace( /\s+/g, '-' )
		);
		const screenshotFilename = `${testFile}__${mochaTest.title}`;
		try {
			saveScreenshot( screenshotFilename, `${testEnv.settings.outputDir}/screenshots` );
		} catch ( error ) {
			console.error( 'failed writing screenshot ...' );
			console.error( error );
		}
	},
	onComplete: async ( exitCode?: number ): Promise<void> => {
		// Prompts to exit and keep Test Services up if there were failures
		if ( exitCode === 1 ) {
			return testEnv.exitPrompt();
		}
		return testEnv.down();
	}
};

export const makeTestSettings = ( settings: Partial<TestSettings> ): TestSettings => {
	// NOTE: The values from these env files are put in testEnv.vars
	// to better isolate the test-service testEnv from the parent process
	const testEnvVars = loadEnvFiles( settings.envFiles || defaultTestSettings.envFiles );
	const testSuiteSettings: TestSuiteSettings = {
		name: settings.name,
		isBaseSuite: settings.isBaseSuite,
		specs: settings.specs
	};
	const debug = process.env.DEBUG === 'true' || process.env.DEBUG === 'node';
	const debugNode = process.env.DEBUG === 'node';
	const outputDir = `suites/${settings.name}/results`;
	const testRunnerSettings: TestRunnerSettings = {
		debug,
		debugNode,
		outputDir,
		runHeaded: process.env.HEADED_TESTS === 'true',
		logLevel: process.env.TEST_LOG_LEVEL,
		testTimeout: debug ? ONE_DAY_IN_MS : parseInt( process.env.MOCHA_OPTS_TIMEOUT ),
		waitForTimeout: debug ? ONE_DAY_IN_MS : parseInt( process.env.WAIT_FOR_TIMEOUT ),
		maxInstances: parseInt( process.env.MAX_INSTANCES ),
		pwd: process.env.HOST_PWD || process.cwd()
	};
	const testEnvironmentSettings: TestEnvSettings = {
		composeFiles: settings.composeFiles || defaultTestSettings.composeFiles,
		waitForUrls: settings.waitForUrls || defaultTestSettings.waitForUrls,
		envFiles: settings.envFiles || defaultTestSettings.envFiles,
		vars: testEnvVars
	};
	const testHooks: TestHooks = {
		onPrepare: settings.onPrepare || defaultTestSettings.onPrepare,
		beforeServices: settings.beforeServices || defaultTestSettings.beforeServices,
		before: settings.before || defaultTestSettings.before,
		afterTest: settings.afterTest || defaultTestSettings.afterTest,
		onComplete: settings.onComplete || defaultTestSettings.onComplete
	};

	return {
		...testSuiteSettings,
		...testRunnerSettings,
		...testEnvironmentSettings,
		...testHooks
	} as TestSettings;
};
