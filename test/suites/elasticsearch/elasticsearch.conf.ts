import { TestEnvironment } from "../../setup/TestEnvironment.js";
import wdioConfig from "../../setup/wdio.conf.js";

export const environment = TestEnvironment.createAppendingToDefaults( {
	name: 'elasticsearch',
	specs: [
		'specs/elasticsearch/*.ts'
	],
	composeFiles: [
		'suites/elasticsearch/docker-compose.override.yml'
	],
	waitForURLs: ( settings ) => ( [
		`http://${settings.envVars.MW_ELASTIC_HOST}:${settings.envVars.MW_ELASTIC_PORT}`
	] )
} );

export const config = wdioConfig( environment );
