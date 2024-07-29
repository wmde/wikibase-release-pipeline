import TestEnv from '../../setup/test-env.js';
import wdioConfig from '../../setup/wdio.conf.js';

export const testEnv = TestEnv.createWithDefaults( {
	name: 'repo',
	specs: [ 'specs/queryservice.ts' ]
} );

export const config = wdioConfig( testEnv );
