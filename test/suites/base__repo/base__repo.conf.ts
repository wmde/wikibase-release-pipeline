import { TestConfig } from '../../setup/TestConfig.js';
import { TestEnvironment } from '../../setup/TestEnvironment.js';
import { wdioConfig } from '../../setup/wdio.conf.js';

export const settings = TestConfig.getSettings( {
	name: 'base__repo',
	specs: [
		'specs/repo/api.ts',
		'specs/repo/property.ts',
		'specs/repo/special-item.ts',
		'specs/repo/special-property.ts',
		'specs/repo/queryservice.ts'
	]
} );

export const environment = TestEnvironment.createAppendingToDefaults( {
	composeFiles: [
		'suites/repo/docker-compose.override.yml'
	]
}, settings );

export const config: WebdriverIO.Config = wdioConfig( settings, environment );
