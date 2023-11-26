import WikibaseApi from 'wdio-wikibase/wikibase.api.js';
import { TestSetup, TestSetupConfig } from './TestSetup.js';
import { defaultFunctions as defaultFunctionsInit } from '../helpers/default-functions.js';

export const defaultTestSetupConfig: TestSetupConfig = {
	envFiles: [
		'../variables.env',
		'default.env',
		'../local.env'
	],
	composeFiles: [
		'suites/docker-compose.yml'
	],
	waitForURLs: [
		`${process.env.MW_SERVER}/wiki/Main_Page`,
		`http://${process.env.WDQS_SERVER}/bigdata/namespace/wdq/sparql`,
		`http://${process.env.WDQS_FRONTEND_SERVER}`
	],
	skipLocalDockerImageLoad: false,
	runHeaded: false,
	before: async () => {
		defaultFunctionsInit();

		await WikibaseApi.initialize(
			undefined,
			process.env.MW_ADMIN_NAME,
			process.env.MW_ADMIN_PASS
		);
	}
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
			waitForURLs: [
				...defaultTestSetupConfig.waitForURLs,
				...( config.waitForURLs || [] )
			],
			before: async (): Promise<void> => {
				await defaultTestSetupConfig.before();
				if ( config.before ) {
					await config.before();
				}
			}
		};

		super( suiteName, testConfig );
	}

}
