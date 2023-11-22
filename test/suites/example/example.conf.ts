import { TestSetup, defaultTestSetupConfig } from '../../helpers/TestSetup.js';
import { wdioConfig } from '../../wdio.conf.js';

export const specs = [
	'../../specs/quickstatements/*.ts',
	'../../specs/repo/queryservice.ts',
	'../../specs/elasticsearch/*.ts'
];

export const testSetup = new TestSetup( 'example', {
	skipLocalDockerImageLoad: true,
	composeFiles: [
		'./example/docker-compose.yml',
		'./example/docker-compose.extra.yml',
		'./suites/example/docker-compose.override.yml'
	],
	envFiles: [
		'./example/template.env',
		'./suites/example/example.env'
	],
	checkIfUpURLs: defaultTestSetupConfig.checkIfUpURLs
} );

export const config: WebdriverIO.Config = wdioConfig( testSetup, specs );
