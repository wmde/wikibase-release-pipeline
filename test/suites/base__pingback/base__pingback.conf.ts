import { TestEnvironment } from '../../setup/TestEnvironment.js';
import wdioConfig from '../../setup/wdio.conf.js';

export const environment = TestEnvironment.createAppendingToDefaults( {
	name: 'base__pingback',
	specs: [
		'specs/pingback/*.ts'
	],
	composeFiles: [
		'suites/pingback/docker-compose.override.yml'
	]
} );

export const config = wdioConfig( environment );
