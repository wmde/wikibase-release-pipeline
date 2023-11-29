import { TestConfig } from '../../setup/TestConfig.js';
import { TestEnvironment, defaultTestEnvironmentSettings } from '../../setup/TestEnvironment.js';
import { wdioConfig } from '../../setup/wdio.conf.js';

export const settings = TestConfig.getSettings( {
	name: 'example',
	specs: [
		'specs/quickstatements/*.ts',
		'specs/repo/queryservice.ts',
		'specs/elasticsearch/*.ts'
	]
} );

export const environment = new TestEnvironment( {
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
	waitForURLs: defaultTestEnvironmentSettings.waitForURLs,
}, settings );

export const config: WebdriverIO.Config = wdioConfig( settings, environment );
