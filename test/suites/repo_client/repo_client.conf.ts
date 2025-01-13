import TestEnv from '../../setup/test-env.js';
import wdioConfig from '../../setup/wdio.conf.js';

export const testEnv = TestEnv.createWithDefaults( {
	name: 'repo_client',
	specs: [ 'specs/repo_client/*.ts', 'specs/repo_client/extensions/*.ts' ],
	envFiles: [
		'../deploy/template.env',
		'./test-services.env',
		'../local.env'
	],
	composeFiles: [
		'../deploy/docker-compose.yml',
		'suites/docker-compose.override.yml',
		'suites/repo_client/docker-compose.override.yml'
	]
} );

export const config = wdioConfig( testEnv );
