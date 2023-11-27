import WikibaseApi from 'wdio-wikibase/wikibase.api.js';
import { TestSetup, TestSetupConfig } from './TestSetup.js';
import { defaultFunctions as defaultFunctionsInit } from './default-functions.js';
import loadLocalDockerImage from './loadLocalDockerImage.js';

export const defaultTestSetupConfig: TestSetupConfig = {
	envFiles: [
		'../variables.env',
		'default.env',
		'../local.env'
	],

	composeFiles: [
		'suites/docker-compose.yml'
	],

	waitForURLs: () => ( [
		`${process.env.MW_SERVER}/wiki/Main_Page`,
		`http://${process.env.WDQS_SERVER}/bigdata/namespace/wdq/sparql`,
		`http://${process.env.WDQS_FRONTEND_SERVER}`
	] ),

	beforeServices: ( isBaseSuite: boolean ): void => {
		process.env.WIKIBASE_TEST_IMAGE_NAME = isBaseSuite ?
			process.env.WIKIBASE_IMAGE_NAME :
			process.env.WIKIBASE_BUNDLE_IMAGE_NAME;

		const defaultImages = [
			process.env.WIKIBASE_TEST_IMAGE_NAME,
			process.env.WDQS_IMAGE_NAME,
			process.env.WDQS_FRONTEND_IMAGE_NAME,
			process.env.WDQS_PROXY_IMAGE_NAME
		];

		const bundleImages = [
			process.env.ELASTICSEARCH_IMAGE_NAME,
			process.env.QUICKSTATEMENTS_IMAGE_NAME
		];

		defaultImages.forEach( ( defaultImage ) => loadLocalDockerImage( defaultImage ) );

		if ( !isBaseSuite ) {
			bundleImages.forEach( ( bundleImage ) => loadLocalDockerImage( bundleImage ) );
		}

		// Does it do anything to be adding the ":latest" tag to these?
		process.env.WIKIBASE_TEST_IMAGE_NAME = `${process.env.WIKIBASE_TEST_IMAGE_NAME}:latest`;
		process.env.QUERYSERVICE_IMAGE_NAME = `${process.env.QUERYSERVICE_IMAGE_NAME}:latest`;
		process.env.QUERYSERVICE_UI_IMAGE_NAME = `${process.env.QUERYSERVICE_IMAGE_NAME}:latest`;
		process.env.WDQS_PROXY_IMAGE_NAME = `${process.env.WDQS_PROXY_IMAGE_NAME}:latest`;
		process.env.QUICKSTATEMENTS_IMAGE_NAME = `${process.env.QUICKSTATEMENTS_IMAGE_NAME}:latest`;
		process.env.ELASTICSEARCH_IMAGE_NAME = `${process.env.ELASTICSEARCH_IMAGE_NAME}:latest`;
	},

	before: async () => {
		defaultFunctionsInit();

		await WikibaseApi.initialize(
			undefined,
			process.env.MW_ADMIN_NAME,
			process.env.MW_ADMIN_PASS
		);
	},

	runHeaded: false
};

export class DefaultTestSetup extends TestSetup {
	public constructor(
		suiteName: string,
		config: TestSetupConfig = {}
	) {
		const testConfig = {
			...defaultTestSetupConfig,
			...config,
			envFiles: [
				...defaultTestSetupConfig.envFiles,
				...( config.envFiles || [] )
			],
			composeFiles: [
				...defaultTestSetupConfig.composeFiles,
				...( config.composeFiles || [] )
			],
			waitForURLs: () => ( [
				...defaultTestSetupConfig.waitForURLs(),
				...( config.waitForURLs ? config.waitForURLs : () => ( [] ) )()
			] ),
			before: async (): Promise<void> => {
				await defaultTestSetupConfig.before();
				if ( config.before ) {
					await config.before();
				}
			},
			beforeServices: (): void => {
				defaultTestSetupConfig.beforeServices( this.isBaseSuite );
				if ( config.beforeServices ) {
					config.beforeServices( this.isBaseSuite );
				}
			}
		};

		super( suiteName, testConfig );
	}
}
