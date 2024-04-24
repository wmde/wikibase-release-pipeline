import { defaultTestSettings } from '../../setup/make-test-settings.js';
import TestEnv from '../../setup/test-env.js';
import wdioConfig from '../../setup/wdio.conf.js';

export const testEnv = TestEnv.createWithDefaults( {
	name: 'repo',
	specs: [ 'specs/queryservice/*.ts' ],
	composeFiles: [ ...defaultTestSettings.composeFiles ]
} );

export const config = wdioConfig( testEnv );
