import TestSettings, {
	TestEnvironmentSettings,
	TestHooks,
	TestRunnerSettings,
	TestSuiteSettings
} from './TestSettings.js';
import loadEnvFiles from './loadEnvVars.js';
import loadLocalDockerImage from './loadLocalDockerImage.js';

export const defaultComposeFiles = [
	'suites/docker-compose.yml'
];

export const defaultEnvFiles: string[] = [
	'./setup/default.env',
	'../local.env'
];

export const defaultWaitForURLs = ( settings ) => ( [
	`${globalThis.env.MW_SERVER}/wiki/Main_Page`,
	`http://${globalThis.env.WDQS_SERVER}/bigdata/namespace/wdq/sparql`,
	`http://${globalThis.env.WDQS_FRONTEND_SERVER}`
] );
	
export const defaultBeforeServices = ( settings ): void => {
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

export const makeSettings = ( providedSettings: Partial<TestSettings> ): TestSettings => {
	globalThis.env = loadEnvFiles( providedSettings.envFiles || defaultEnvFiles ) as NodeJS.ProcessEnv;
	const testSuiteSettings: TestSuiteSettings = {
		name: providedSettings.name,
		nameWithoutBase: providedSettings.name.replace( 'base__', '' ),
		isBaseSuite: providedSettings.name !== providedSettings.nameWithoutBase,
		specs: providedSettings.specs,
	}
	const testRunnerSettings: TestRunnerSettings = {
		runHeaded: !!globalThis.env.HEADED_TESTS,
		logLevel: globalThis.env.TEST_LOG_LEVEL,
		testTimeout: parseInt( globalThis.env.MOCHA_OPTS_TIMEOUT ),
		waitForTimeout: parseInt( globalThis.env.WAIT_FOR_TIMEOUT ),
		baseUrl: globalThis.env.MW_SERVER + globalThis.env.MW_SCRIPT_PATH,
		pwd: process.env.HOST_PWD || process.cwd(),
		outputDir: `suites/${providedSettings.name}/results`,
		resultFilePath: `suites/${providedSettings.name}/results/result.json`,
		screenshotPath: `suites/${providedSettings.name}/results/screenshots`,
	}
	const testHooks: TestHooks = {
		beforeServices: defaultBeforeServices
	}
	const testEnvironmentSettings: TestEnvironmentSettings = {
		composeFiles: defaultComposeFiles,
		waitForURLs: defaultWaitForURLs
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
		waitForURLs: ( settings ) => {
			let waitForUrls = defaultWaitForURLs( settings );
			if ( providedSettings.waitForURLs ) {
				waitForUrls = [
					...waitForUrls,
					...providedSettings.waitForURLs( settings )
				];
			}
			return waitForUrls;
		},
		beforeServices: ( settings ) => {
			defaultBeforeServices( settings );
			if ( providedSettings.beforeServices ) providedSettings.beforeServices( settings );
		}
	}

	return makeSettings( appendedSettings );
};
