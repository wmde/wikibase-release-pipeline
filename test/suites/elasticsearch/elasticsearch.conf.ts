import TestEnv from '../../setup/TestEnv.js';
import { defaultTestSettings } from '../../setup/makeTestSettings.js';
import wdioConfig from '../../setup/wdio.conf.js';

export const testEnv = TestEnv.createWithDefaults( {
	name: 'elasticsearch',
	specs: [
		'specs/elasticsearch/*.ts'
	],
	composeFiles: [
		...defaultTestSettings.composeFiles,
		'suites/elasticsearch/docker-compose.override.yml'
	],
	waitForUrls: () => ( [
		...defaultTestSettings.waitForUrls(),
		`http://${testEnv.vars.MW_ELASTIC_HOST}:${testEnv.vars.MW_ELASTIC_PORT}`
	] )
} );

export const config = wdioConfig( testEnv );
