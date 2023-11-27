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
		process.env.WIKIBASE_TEST_IMAGE = isBaseSuite ?
			process.env.WIKIBASE_IMAGE :
			process.env.WIKIBASE_BUNDLE_IMAGE;

		const defaultImages = [
			process.env.WIKIBASE_TEST_IMAGE,
			process.env.WDQS_IMAGE,
			process.env.WDQS_FRONTEND_IMAGE,
			process.env.WDQS_PROXY_IMAGE
		];

		const bundleImages = [
			process.env.ELASTICSEARCH_IMAGE,
			process.env.QUICKSTATEMENTS_IMAGE
		];

		// Does it do anything to be adding the ":latest" tag to these?
		process.env.WIKIBASE_TEST_IMAGE = `${process.env.WIKIBASE_TEST_IMAGE}:latest`;
		process.env.QUERYSERVICE_IMAGE = `${process.env.QUERYSERVICE_IMAGE}:latest`;
		process.env.QUERYSERVICE_UI_IMAGE = `${process.env.QUERYSERVICE_IMAGE}:latest`;
		process.env.WDQS_PROXY_IMAGE = `${process.env.WDQS_PROXY_IMAGE}:latest`;
		process.env.QUICKSTATEMENTS_IMAGE = `${process.env.QUICKSTATEMENTS_IMAGE}:latest`;
		process.env.ELASTICSEARCH_IMAGE = `${process.env.ELASTICSEARCH_IMAGE}:latest`;

		defaultImages.forEach( ( defaultImage ) => loadLocalDockerImage( defaultImage ) );

		if ( !isBaseSuite ) {
			bundleImages.forEach( ( bundleImage ) => loadLocalDockerImage( bundleImage ) );
		}
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
