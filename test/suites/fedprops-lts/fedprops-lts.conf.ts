import TestEnv from '../../setup/test-env.js';
import wdioConfig from '../../setup/wdio.conf.js';

export const testEnv = TestEnv.createWithDefaults( {
	name: 'fedprops-lts',
	specs: [ 'specs/fedprops/*.ts' ],
	envFiles: [
		'../deploy-lts/template.env',
		'./test-services.env',
		'../local.env'
	],
	composeFiles: [
		'../deploy-lts/docker-compose.yml',
		'suites/docker-compose.override.yml',
		'suites/docker-compose-lts.override.yml',
		'suites/fedprops/docker-compose.override.yml'
	]
} );

export const config = wdioConfig( testEnv );
