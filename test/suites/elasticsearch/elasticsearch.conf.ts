import { DefaultTestSetup } from '../../helpers/TestSetup.js';
import { wdioConfig } from '../../wdio.conf.js';

const specs = [
	'../../specs/elasticsearch/*.ts'
];

export const testSetup = new DefaultTestSetup( 'elasticsearch', {
	composeFiles: [
		'./suites/elasticsearch/docker-compose.override.yml'
	],
	checkIfUpURLs: [
		`http://${process.env.MW_ELASTIC_HOST}:${process.env.MW_ELASTIC_PORT}`
	]
});

export const config: WebdriverIO.Config = wdioConfig( testSetup, specs );
