import TestEnv from '../../setup/TestEnv.js';
import { defaultTestSettings } from '../../setup/makeTestSettings.js';
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
