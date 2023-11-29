import { DefaultTestEnvironment } from '../../setup/DefaultTestEnvironment.js';
import { wdioConfig } from '../../wdio.conf.js';

export const specs = [
	'specs/elasticsearch/*.ts'
];

export const testEnvironment = new DefaultTestEnvironment( 'elasticsearch', {
	composeFiles: [
		'suites/elasticsearch/docker-compose.override.yml'
	],
	waitForURLs: () => ( [
		`http://${process.env.MW_ELASTIC_HOST}:${process.env.MW_ELASTIC_PORT}`
	] )
} );

export const config: WebdriverIO.Config = wdioConfig( testEnvironment, specs );
