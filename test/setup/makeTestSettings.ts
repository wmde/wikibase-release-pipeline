import TestSettings, {
	TestEnvironmentSettings,
	TestHooks,
	TestRunnerSettings,
	TestServiceSettings,
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
	`${settings.envVars.MW_SERVER}/wiki/Main_Page`,
	`http://${settings.envVars.WDQS_SERVER}/bigdata/namespace/wdq/sparql`,
	`http://${settings.envVars.WDQS_FRONTEND_SERVER}`
] );
	
export const defaultBeforeServices = ( settings ): void => {
	settings.envVars.WIKIBASE_TEST_IMAGE_NAME = settings.isBaseSuite ?
		settings.envVars.WIKIBASE_IMAGE_NAME : settings.envVars.WIKIBASE_BUNDLE_IMAGE_NAME;

	const dockerImageUrls = [
		settings.envVars.WIKIBASE_TEST_IMAGE_NAME,
		settings.envVars.WDQS_IMAGE_NAME,
		settings.envVars.WDQS_FRONTEND_IMAGE_NAME,
		settings.envVars.WDQS_PROXY_IMAGE_NAME
	];
	const dockerExtraImageUrls = [
		settings.envVars.ELASTICSEARCH_IMAGE_NAME,
		settings.envVars.QUICKSTATEMENTS_IMAGE_NAME
	];

	dockerImageUrls.forEach( ( defaultImage ) => loadLocalDockerImage( defaultImage as string ) );

	if ( !settings.isBaseSuite ) {
		dockerExtraImageUrls.forEach( ( bundleImage ) => loadLocalDockerImage( bundleImage as string ) );
	}
};

export const makeSettings = ( providedSettings: Partial<TestSettings> ): TestSettings => {
	const envVars = loadEnvFiles( providedSettings.envFiles || defaultEnvFiles );
	const testSuiteSettings: TestSuiteSettings = {
		name: providedSettings.name,
		nameWithoutBase: providedSettings.name.replace( 'base__', '' ),
		isBaseSuite: providedSettings.name !== providedSettings.nameWithoutBase,
		specs: providedSettings.specs,
	}
	const testRunnerSettings: TestRunnerSettings = {
		runHeaded: !!envVars.HEADED_TESTS,
		logLevel: envVars.TEST_LOG_LEVEL,
		testTimeout: parseInt( envVars.MOCHA_OPTS_TIMEOUT ),
		waitForTimeout: parseInt( envVars.WAIT_FOR_TIMEOUT ),
		baseUrl: envVars.MW_SERVER + envVars.MW_SCRIPT_PATH,
		pwd: process.env.HOST_PWD || process.cwd(),
		outputDir: `suites/${providedSettings.name}/results`,
		resultFilePath: `suites/${providedSettings.name}/results/result.json`,
		screenshotPath: `suites/${providedSettings.name}/results/screenshots`,
	}
	const testServicesSettings: TestServiceSettings = {
		envVars
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
		...testServicesSettings,
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
