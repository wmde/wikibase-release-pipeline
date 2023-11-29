import { TestConfig } from '../../setup/TestConfig.js';
import { TestEnvironment } from '../../setup/TestEnvironment.js';
import { wdioConfig } from '../../setup/wdio.conf.js';

export const settings = TestConfig.getSettings( {
	name: 'quickstatements',
	specs: [
		'specs/repo_client/interwiki-links.ts',
		'specs/quickstatements/*.ts'	]
} );

export const environment = TestEnvironment.createAppendingToDefaults( {
	composeFiles: [
		'suites/quickstatements/docker-compose.override.yml'
	],
	waitForURLs: () => ( [
		settings.qsServer,
		settings.mwClientServer
	] )
}, settings );

export const config: WebdriverIO.Config = wdioConfig( settings, environment );
