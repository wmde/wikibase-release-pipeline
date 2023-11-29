import { TestConfig } from '../../setup/TestConfig.js';
import { TestEnvironment } from '../../setup/TestEnvironment.js';
import { wdioConfig } from '../../setup/wdio.conf.js';

export const settings = TestConfig.getSettings( {
	name: 'confirm_edit',
	specs: [
		'specs/confirm_edit/*.ts'
	]
} );

export const environment = TestEnvironment.createAppendingToDefaults( {
	composeFiles: [
		'suites/confirm_edit/docker-compose.override.yml'
	]
}, settings );

export const config: WebdriverIO.Config = wdioConfig( settings, environment );
