import { defaultTestSettings } from '../../setup/make-test-settings.js';
import TestEnv from '../../setup/test-env.js';
import wdioConfig from '../../setup/wdio.conf.js';

export const testEnv = TestEnv.createWithDefaults( {
	name: 'confirm_edit',
	specs: [ 'specs/confirm_edit/*.ts' ],
	composeFiles: [
		...defaultTestSettings.composeFiles,
		'suites/confirm_edit/docker-compose.override.yml'
	]
} );

export const config = wdioConfig( testEnv );
