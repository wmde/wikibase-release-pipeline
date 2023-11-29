import { TestConfig } from '../../setup/TestConfig.js';
import { TestEnvironment } from '../../setup/TestEnvironment.js';
import { wdioConfig } from '../../setup/wdio.conf.js';

export const settings = TestConfig.getSettings( {
	name: 'elasticsearch',
	specs: [
		'specs/elasticsearch/*.ts'
	]
} );

export const environment = TestEnvironment.createAppendingToDefaults( {
	composeFiles: [
		'suites/elasticsearch/docker-compose.override.yml'
	],
	waitForURLs: () => ( [
		settings.elasticsearchServer
	] )
}, settings );

export const config: WebdriverIO.Config = wdioConfig( settings, environment );
