import { TestEnvironment } from '../../setup/TestEnvironment.js';
import wdioConfig from '../../setup/wdio.conf.js';

export const environment = TestEnvironment.createWithDefaults( {
	name: 'example',
	specs: [
		'specs/quickstatements/*.ts',
		'specs/repo/queryservice.ts',
		'specs/elasticsearch/*.ts'
	],
	composeFiles: [
		'../example/docker-compose.yml',
		'../example/docker-compose.extra.yml',
		'suites/example/docker-compose.override.yml'
	],
	envFiles: [
		'../example/template.env',
		'suites/example/example.env',
		'../local.env'
	]
} );

export const config = wdioConfig( environment );
