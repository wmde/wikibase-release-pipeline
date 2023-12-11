import TestEnv from '../../setup/TestEnv.js';
import wdioConfig from '../../setup/wdio.conf.js';

global.testEnv = TestEnv.createAppendingToDefaults( {
	name: 'elasticsearch',
	specs: [
		'specs/elasticsearch/*.ts'
	],
	composeFiles: [
		'suites/elasticsearch/docker-compose.override.yml'
	],
	waitForURLs: ( { vars } ) => ( [
		`http://${vars.MW_ELASTIC_HOST}:${testEnv.vars.MW_ELASTIC_PORT}`
	] )
} );

export const config = wdioConfig();
