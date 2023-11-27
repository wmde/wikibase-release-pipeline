import { TestSetup } from '../../helpers/TestSetup.js';
import { defaultTestSetupConfig } from '../../helpers/DefaultTestSetup.js';
import { wdioConfig } from '../../wdio.conf.js';

export const specs = [
	'specs/quickstatements/*.ts',
	'specs/repo/queryservice.ts',
	'specs/elasticsearch/*.ts'
];

export const testSetup = new TestSetup( 'example', {
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
	waitForURLs: defaultTestSetupConfig.waitForURLs,
	before: defaultTestSetupConfig.before
} );

export const config: WebdriverIO.Config = wdioConfig( testSetup, specs );
