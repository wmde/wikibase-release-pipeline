import TestEnv from '../../setup/TestEnv.js';
import wdioConfig from '../../setup/wdio.conf.js';

const testEnv = TestEnv.createAppendingToDefaults( {
	name: 'elasticsearch',
	specs: [
		'specs/elasticsearch/*.ts'
	],
	composeFiles: [
		'suites/elasticsearch/docker-compose.override.yml'
	],
	waitForURLs: () => ( [
		`http://${testEnv.vars.MW_ELASTIC_HOST}:${testEnv.vars.MW_ELASTIC_PORT}`
	] )
} );

export const config = wdioConfig( testEnv );
