import { TestEnvironment } from "../../setup/TestEnvironment.js";
import wdioConfig from "../../setup/wdio.conf.js";

export const environment = TestEnvironment.createAppendingToDefaults( {
	name: 'repo_client',
	specs: [
		'specs/repo_client/*.ts',
		'specs/repo_client/extensions/*.ts'
	],
	composeFiles: [
		'suites/repo_client/docker-compose.override.yml'
	],
	waitForURLs: () => ( [
		globalThis.env.MW_CLIENT_SERVER
	] )
} );

export const config = wdioConfig( environment );
