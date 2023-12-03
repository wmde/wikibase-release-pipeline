import { SevereServiceError } from 'webdriverio';
import WikibaseApi from 'wdio-wikibase/wikibase.api.js';
import { defaultFunctions as defaultFunctionsInit } from '../helpers/default-functions.js';
import loadEnvFiles from './loadEnvVars.js';
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
	'./test-services.env',
	'../local.env'
];

export const defaultWaitForURLs = () => ( [
	`${globalThis.env.MW_SERVER}/wiki/Main_Page`,
	`${globalThis.env.WDQS_SERVER}/bigdata/namespace/wdq/sparql`,
	globalThis.env.WDQS_FRONTEND_SERVER
] );

export const defaultOnPrepare = async ( environment ): Promise<void> => {
	environment.up()
}

export const defaultBeforeServices = async ( { settings } ): Promise<void> => {
	globalThis.env.WIKIBASE_TEST_IMAGE_NAME = settings.isBaseSuite ?
		globalThis.env.WIKIBASE_IMAGE_NAME : globalThis.env.WIKIBASE_BUNDLE_IMAGE_NAME;

	const dockerImageUrls = [
		globalThis.env.WIKIBASE_TEST_IMAGE_NAME,
		globalThis.env.WDQS_IMAGE_NAME,
		globalThis.env.WDQS_FRONTEND_IMAGE_NAME,
		globalThis.env.WDQS_PROXY_IMAGE_NAME
	];
	const dockerExtraImageUrls = [
		globalThis.env.ELASTICSEARCH_IMAGE_NAME,
		globalThis.env.QUICKSTATEMENTS_IMAGE_NAME
	];

	dockerImageUrls.forEach( ( defaultImage ) => loadLocalDockerImage( defaultImage as string ) );

	if ( !settings.isBaseSuite ) {
		dockerExtraImageUrls.forEach( ( bundleImage ) => loadLocalDockerImage( bundleImage as string ) );
	}
};

export const defaultBefore = async ( environment ): Promise<void> => {
	try {
		defaultFunctionsInit( environment );

		await WikibaseApi.initialize(
			undefined,
			globalThis.env.MW_ADMIN_NAME,
			globalThis.env.MW_ADMIN_PASS
		);
	} catch ( e ) {
		console.log('!!! error', e)
		throw new SevereServiceError( e );
	}
}

export const defaultAfterTest = async ( mochaTest, environment ): Promise<void> => {
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
}

export const defaultOnComplete = async ( environment ): Promise<void> => {
	environment.down()
}

export const makeSettings = ( providedSettings: Partial<TestSettings> ): TestSettings => {
	globalThis.env = loadEnvFiles( providedSettings.envFiles || defaultEnvFiles ) as NodeJS.ProcessEnv;
	const nameWithoutBase = providedSettings.name.replace( 'base__', '' );
	const testSuiteSettings: TestSuiteSettings = {
		name: providedSettings.name,
		nameWithoutBase,
		isBaseSuite: providedSettings.name !== nameWithoutBase,
		specs: providedSettings.specs,
	}
	const outputDir = `suites/${providedSettings.name}/results`;
	const testRunnerSettings: TestRunnerSettings = {
		runHeaded: process.env.HEADED_TESTS === 'true',
		logLevel: process.env.TEST_LOG_LEVEL,
		testTimeout: parseInt( process.env.MOCHA_OPTS_TIMEOUT ),
		waitForTimeout: parseInt( process.env.WAIT_FOR_TIMEOUT ),
		maxInstances: parseInt( process.env.MAX_INSTANCES ),
		baseUrl: globalThis.env.MW_SERVER + globalThis.env.MW_SCRIPT_PATH,
		pwd: process.env.HOST_PWD || process.cwd(),
		outputDir,
		resultFilePath: `${outputDir}/result.json`,
		screenshotPath: `${outputDir}/screenshots`,
	}
	const testHooks: TestHooks = {
		onPrepare: providedSettings.onPrepare || defaultOnPrepare,
		beforeServices: providedSettings.beforeServices || defaultBeforeServices,
		before: providedSettings.before || defaultBefore,
		afterTest: providedSettings.afterTest || defaultAfterTest,
		onComplete: providedSettings.onComplete || defaultOnComplete
	}
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

export function makeSettingsAppendingToDefaults (
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
			if ( providedSettings.onPrepare ) await providedSettings.onPrepare( environment );
		},
		beforeServices: async ( environment ) => {
			await defaultBeforeServices( environment );
			if ( providedSettings.beforeServices ) await providedSettings.beforeServices( environment );
		},
		before: async ( environment ) => {
			await defaultBefore( environment );
			if ( providedSettings.before ) await providedSettings.before( environment );
		},
		afterTest: async ( mochaTest, environment ) => {
			await defaultAfterTest( mochaTest, environment );
			if ( providedSettings.afterTest ) await providedSettings.afterTest( mochaTest, environment );
		},
		onComplete: async ( environment ) => {
			await defaultOnComplete( environment );
			if ( providedSettings.onComplete ) await providedSettings.onComplete( environment );
		}
	}

	return makeSettings( appendedSettings );
};
