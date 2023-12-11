import { SevereServiceError } from 'webdriverio';
import TestEnv from './TestEnv.js';
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
} from '../helpers/types/TestSettings.js';

export const defaultComposeFiles = [
	'suites/docker-compose.yml'
];

export const defaultEnvFiles: string[] = [
	'../variables.env',
	'./test-services.env',
	'../local.env'
];

export const defaultWaitForURLs = ( { vars }: TestEnv ): string[] => {
	return ( [
		`${vars.WIKIBASE_URL}/wiki/Main_Page`,
		`${vars.WDQS_URL}/bigdata/namespace/wdq/sparql`,
		vars.WDQS_FRONTEND_URL
	] );
};

export const defaultOnPrepare = async ( testEnv: TestEnv ): Promise<void> => {
	await testEnv.up();
};

export const defaultBeforeServices = async ( testEnv: TestEnv ): Promise<void> => {
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
};

export const defaultBefore = async ( testEnv: TestEnv ): Promise<void> => {
	try {
		defaultFunctionsInit( testEnv );

		await WikibaseApi.initialize(
			undefined,
			testEnv.vars.MW_ADMIN_NAME,
			testEnv.vars.MW_ADMIN_PASS
		);
	} catch ( e ) {
		throw new SevereServiceError( e );
	}
};

export const defaultAfterTest = async (
	mochaTest: Frameworks.Test,
	testEnv: TestEnv
): Promise<void> => {
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
};

export const defaultOnComplete = async ( testEnv: TestEnv ): Promise<void> => {
	await testEnv.down();
};

export const makeSettings = ( providedSettings: Partial<TestSettings> ): TestSettings => {
	// NOTE: The values from the loaded env files are put on the testEnv global
	// to better isolate the test-service testEnv from the parent process.
	// To use these variables in spec files:
	//   testEnv.vars.WIKIBASE_URL
	const testEnvVars = loadEnvFiles( providedSettings.envFiles || defaultEnvFiles );
	const testSuiteSettings: TestSuiteSettings = {
		name: providedSettings.name,
		isBaseSuite: providedSettings.isBaseSuite,
		specs: providedSettings.specs
	};
	const outputDir = `suites/${providedSettings.name}/results`;
	const testRunnerSettings: TestRunnerSettings = {
		runHeaded: process.env.HEADED_TESTS === 'true',
		logLevel: process.env.TEST_LOG_LEVEL,
		testTimeout: parseInt( process.env.MOCHA_OPTS_TIMEOUT ),
		waitForTimeout: parseInt( process.env.WAIT_FOR_TIMEOUT ),
		maxInstances: parseInt( process.env.MAX_INSTANCES ),
		pwd: process.env.HOST_PWD || process.cwd(),
		outputDir
	};
	const testHooks: TestHooks = {
		onPrepare: providedSettings.onPrepare || defaultOnPrepare,
		beforeServices: providedSettings.beforeServices || defaultBeforeServices,
		before: providedSettings.before || defaultBefore,
		afterTest: providedSettings.afterTest || defaultAfterTest,
		onComplete: providedSettings.onComplete || defaultOnComplete
	};
	const testEnvironmentSettings: TestEnvSettings = {
		composeFiles: providedSettings.composeFiles || defaultComposeFiles,
		waitForURLs: providedSettings.waitForURLs || defaultWaitForURLs,
		envFiles: providedSettings.envFiles || defaultEnvFiles,
		vars: testEnvVars
	};

	return {
		...testSuiteSettings,
		...testRunnerSettings,
		...testHooks,
		...testEnvironmentSettings
	} as TestSettings;
};

export function makeSettingsAppendingToDefaults(
	providedSettings: Partial<TestSettings>
): TestSettings {
	const appendedSettings = {
		...providedSettings,
		composeFiles: [
			...defaultComposeFiles,
			...( providedSettings.composeFiles ? providedSettings.composeFiles : [] )
		],
		envFiles: [
			...defaultEnvFiles,
			...( providedSettings.envFiles ? providedSettings.envFiles : [] )
		],
		waitForURLs: ( testEnv ) => {
			let waitForUrls = defaultWaitForURLs( testEnv );
			if ( providedSettings.waitForURLs ) {
				waitForUrls = [
					...waitForUrls,
					...providedSettings.waitForURLs( testEnv )
				];
			}
			return waitForUrls;
		},
		onPrepare: async ( testEnv ) => {
			await defaultOnPrepare( testEnv );
			if ( providedSettings.onPrepare ) {
				await providedSettings.onPrepare( testEnv );
			}
		},
		beforeServices: async ( testEnv ) => {
			await defaultBeforeServices( testEnv );
			if ( providedSettings.beforeServices ) {
				await providedSettings.beforeServices( testEnv );
			}
		},
		before: async ( testEnv ) => {
			await defaultBefore( testEnv );
			if ( providedSettings.before ) {
				await providedSettings.before( testEnv );
			}
		},
		afterTest: async ( mochaTest, testEnv ) => {
			await defaultAfterTest( mochaTest, testEnv );
			if ( providedSettings.afterTest ) {
				await providedSettings.afterTest( mochaTest, testEnv );
			}
		},
		onComplete: async ( testEnv ) => {
			await defaultOnComplete( testEnv );
			if ( providedSettings.onComplete ) {
				await providedSettings.onComplete( testEnv );
			}
		}
	};

	return makeSettings( appendedSettings );
}
