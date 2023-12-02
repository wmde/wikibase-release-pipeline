import { TestEnvironment } from "../../setup/TestEnvironment.js";
import wdioConfig from "../../setup/wdio.conf.js";

export const environment = TestEnvironment.createAppendingToDefaults( {
	name: 'quickstatements',
	specs: [
		'specs/repo_client/interwiki-links.ts',
		'specs/quickstatements/*.ts'
	],
	composeFiles: [
		'suites/quickstatements/docker-compose.override.yml'
	],
	waitForURLs: ( settings ) => ( [
		globalThis.env.QS_SERVER,
		globalThis.env.MW_CLIENT_SERVER
	] )
} );

export const config = wdioConfig( environment );
