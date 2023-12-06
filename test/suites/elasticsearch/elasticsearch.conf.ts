import TestEnvironment from '../../setup/TestEnvironment.js';
import envVars from '../../setup/envVars.js';
import wdioConfig from '../../setup/wdio.conf.js';

export const testEnv = TestEnvironment.createAppendingToDefaults( {
	name: 'elasticsearch',
	specs: [
		'specs/elasticsearch/*.ts'
	],
	composeFiles: [
		'suites/elasticsearch/docker-compose.override.yml'
	],
	waitForURLs: () => ( [
		`http://${envVars.MW_ELASTIC_HOST}:${envVars.MW_ELASTIC_PORT}`
	] )
} );

export const config = wdioConfig( testEnv );
