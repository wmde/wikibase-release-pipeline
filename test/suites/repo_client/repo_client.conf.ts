import { TestConfig } from '../../setup/TestConfig.js';
import { TestEnvironment } from '../../setup/TestEnvironment.js';
import { wdioConfig } from '../../setup/wdio.conf.js';

export const settings = TestConfig.getSettings( {
	name: 'repo_client',
	specs: [
		'specs/repo_client/*.ts',
		'specs/repo_client/extensions/*.ts'	]
} );

export const environment = TestEnvironment.createAppendingToDefaults( {
	composeFiles: [
		'suites/repo_client/docker-compose.override.yml'
	],
	waitForURLs: () => ( [
		settings.mwClientServer
	] )
}, settings );

export const config: WebdriverIO.Config = wdioConfig( settings, environment );
