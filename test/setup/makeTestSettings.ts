import { SevereServiceError } from 'webdriverio';
import { TestEnvironment } from './TestEnvironment.js';
import { Frameworks } from '@wdio/types';
import WikibaseApi from 'wdio-wikibase/wikibase.api.js';
import { defaultFunctions as defaultFunctionsInit } from '../helpers/default-functions.js';
import envVars, { loadEnvFiles } from './envVars.js';
import loadLocalDockerImage from './loadLocalDockerImage.js';
import { saveScreenshot } from 'wdio-mediawiki';
import TestSettings, {
	TestEnvironmentSettings,
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

export const defaultWaitForURLs = (): string[] => ( [
	`${envVars.WIKIBASE_URL}/wiki/Main_Page`,
	`${envVars.WDQS_URL}/bigdata/namespace/wdq/sparql`,
	envVars.WDQS_FRONTEND_URL
] );

export const defaultOnPrepare = async ( environment: TestEnvironment ): Promise<void> => {
	await environment.up();
};

export const defaultBeforeServices = async ( { settings }: TestEnvironment ): Promise<void> => {
	envVars.WIKIBASE_TEST_IMAGE_URL = settings.isBaseSuite ?
		envVars.WIKIBASE_SUITE_WIKIBASE_IMAGE_URL :
		envVars.WIKIBASE_SUITE_WIKIBASE_BUNDLE_IMAGE_URL;

	const defaultImageUrls = [
		envVars.WIKIBASE_TEST_IMAGE_URL,
		envVars.WIKIBASE_SUITE_WDQS_IMAGE_URL,
		envVars.WIKIBASE_SUITE_WDQS_FRONTEND_IMAGE_URL,
		envVars.WIKIBASE_SUITE_WDQS_PROXY_IMAGE_URL
	];
	const extraImageUrls = [
		envVars.WIKIBASE_SUITE_ELASTICSEARCH_IMAGE_URL,
		envVars.WIKIBASE_SUITE_QUICKSTATEMENTS_IMAGE_URL
	];

	defaultImageUrls.forEach( ( defaultImageUrl ) =>
		loadLocalDockerImage( defaultImageUrl as string ) );

	if ( !settings.isBaseSuite ) {
		extraImageUrls.forEach( ( extraImageUrl ) =>
			loadLocalDockerImage( extraImageUrl as string )
		);
	}
};

export const defaultBefore = async ( environment: TestEnvironment ): Promise<void> => {
	try {
		defaultFunctionsInit( environment );

		await WikibaseApi.initialize(
			undefined,
			envVars.MW_ADMIN_NAME,
			envVars.MW_ADMIN_PASS
		);
	} catch ( e ) {
		throw new SevereServiceError( e );
	}
};

export const defaultAfterTest = async (
	mochaTest: Frameworks.Test,
	environment: TestEnvironment
): Promise<void> => {
	const testFile = encodeURIComponent(
		mochaTest.file.match( /.+\/(.+)\.[jt]s$/ )[ 1 ].replace( /\s+/g, '-' )
	);
	const screenshotFilename = `${testFile}__${mochaTest.title}`;

	try {
		saveScreenshot( screenshotFilename, environment.settings.screenshotPath );
	} catch ( error ) {
		console.error( 'failed writing screenshot ...' );
		console.error( error );
	}
};

export const defaultOnComplete = async ( environment: TestEnvironment ): Promise<void> => {
	await environment.down();
};

export const makeSettings = ( providedSettings: Partial<TestSettings> ): TestSettings => {
	// NOTE: The values from the loaded env files are put into this global variable
	// to better isolate the test-service environment from the parent processes.
	loadEnvFiles( providedSettings.envFiles || defaultEnvFiles );

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
		baseUrl: envVars.WIKIBASE_URL + envVars.MW_SCRIPT_PATH,
		pwd: process.env.HOST_PWD || process.cwd(),
		outputDir,
		resultFilePath: `${outputDir}/result.json`,
		screenshotPath: `${outputDir}/screenshots`
	};
	const testHooks: TestHooks = {
		onPrepare: providedSettings.onPrepare || defaultOnPrepare,
		beforeServices: providedSettings.beforeServices || defaultBeforeServices,
		before: providedSettings.before || defaultBefore,
		afterTest: providedSettings.afterTest || defaultAfterTest,
		onComplete: providedSettings.onComplete || defaultOnComplete
	};
	const testEnvironmentSettings: TestEnvironmentSettings = {
		composeFiles: providedSettings.composeFiles || defaultComposeFiles,
		waitForURLs: providedSettings.waitForURLs || defaultWaitForURLs
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
		waitForURLs: ( environment ) => {
			let waitForUrls = defaultWaitForURLs();
			if ( providedSettings.waitForURLs ) {
				waitForUrls = [
					...waitForUrls,
					...providedSettings.waitForURLs( environment )
				];
			}
			return waitForUrls;
		},
		onPrepare: async ( environment ) => {
			await defaultOnPrepare( environment );
			if ( providedSettings.onPrepare ) {
				await providedSettings.onPrepare( environment );
			}
		},
		beforeServices: async ( environment ) => {
			await defaultBeforeServices( environment );
			if ( providedSettings.beforeServices ) {
				await providedSettings.beforeServices( environment );
			}
		},
		before: async ( environment ) => {
			await defaultBefore( environment );
			if ( providedSettings.before ) {
				await providedSettings.before( environment );
			}
		},
		afterTest: async ( mochaTest, environment ) => {
			await defaultAfterTest( mochaTest, environment );
			if ( providedSettings.afterTest ) {
				await providedSettings.afterTest( mochaTest, environment );
			}
		},
		onComplete: async ( environment ) => {
			await defaultOnComplete( environment );
			if ( providedSettings.onComplete ) {
				await providedSettings.onComplete( environment );
			}
		}
	};

	return makeSettings( appendedSettings );
}
