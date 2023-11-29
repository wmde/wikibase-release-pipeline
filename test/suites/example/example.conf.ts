import { TestEnvironment } from '../../helpers/TestEnvironment.js';
import { defaultTestEnvironmentConfig } from '../../helpers/DefaultTestEnvironment.js';
import { wdioConfig } from '../../wdio.conf.js';

export const specs = [
	'specs/quickstatements/*.ts',
	'specs/repo/queryservice.ts',
	'specs/elasticsearch/*.ts'
];

export const testEnvironment = new TestEnvironment( 'example', {
	composeFiles: [
		'../example/docker-compose.yml',
		'../example/docker-compose.extra.yml',
		'suites/example/docker-compose.override.yml'
	],
	envFiles: [
		'../example/template.env',
		'suites/example/example.env',
		'../local.env'
	],
	waitForURLs: defaultTestEnvironmentConfig.waitForURLs,
	before: defaultTestEnvironmentConfig.before
} );

export const config: WebdriverIO.Config = wdioConfig( testEnvironment, specs );
