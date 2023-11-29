import { TestConfig } from '../../setup/TestConfig.js';
import { TestEnvironment } from '../../setup/TestEnvironment.js';
import { wdioConfig } from '../../setup/wdio.conf.js';

export const settings = TestConfig.getSettings( {
	name: 'repo',
	specs: [
		'specs/repo/*.ts',
		'specs/repo/extensions/*.ts'
	]
} );

export const environment = TestEnvironment.createAppendingToDefaults( {
	composeFiles: [
		'suites/repo/docker-compose.override.yml'
	]
}, settings );

export const config: WebdriverIO.Config = wdioConfig( settings, environment );
