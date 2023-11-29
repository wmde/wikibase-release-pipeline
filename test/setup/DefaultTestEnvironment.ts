import WikibaseApi from 'wdio-wikibase/wikibase.api.js';
import { TestEnvironment, TestEnvironmentConfig } from './TestEnvironment.js';
import { defaultFunctions as defaultFunctionsInit } from '../helpers/default-functions.js';
import loadLocalDockerImage from './loadLocalDockerImage.js';

export const defaultTestEnvironmentConfig: TestEnvironmentConfig = {
	envFiles: [
		'../variables.env',
		'default.env',
		'../local.env'
	],

	composeFiles: [
		'suites/docker-compose.yml'
	],

	beforeServices: ( isBaseSuite: boolean ): void => {
		process.env.WIKIBASE_TEST_IMAGE_NAME = isBaseSuite ?
			process.env.WIKIBASE_IMAGE_NAME : process.env.WIKIBASE_BUNDLE_IMAGE_NAME;

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
	},

	waitForURLs: () => ( [
		`${process.env.MW_SERVER}/wiki/Main_Page`,
		`http://${process.env.WDQS_SERVER}/bigdata/namespace/wdq/sparql`,
		`http://${process.env.WDQS_FRONTEND_SERVER}`
	] ),

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

export class DefaultTestEnvironment extends TestEnvironment {
	public constructor(
		suiteName: string,
		config: TestEnvironmentConfig = {}
	) {
		const testConfig = {
			...defaultTestEnvironmentConfig,
			...config,
			envFiles: [
				...defaultTestEnvironmentConfig.envFiles,
				...( config.envFiles || [] )
			],
			composeFiles: [
				...defaultTestEnvironmentConfig.composeFiles,
				...( config.composeFiles || [] )
			],
			waitForURLs: () => ( [
				...defaultTestEnvironmentConfig.waitForURLs(),
				...( config.waitForURLs ? config.waitForURLs : () => ( [] ) )()
			] ),
			before: async (): Promise<void> => {
				await defaultTestEnvironmentConfig.before();
				if ( config.before ) {
					await config.before();
				}
			},
			beforeServices: (): void => {
				defaultTestEnvironmentConfig.beforeServices( this.isBaseSuite );
				if ( config.beforeServices ) {
					config.beforeServices( this.isBaseSuite );
				}
			}
		};

		super( suiteName, testConfig );
	}
}
