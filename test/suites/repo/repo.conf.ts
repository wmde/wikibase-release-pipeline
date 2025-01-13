import TestEnv from '../../setup/test-env.js';
import wdioConfig from '../../setup/wdio.conf.js';

export const testEnv = TestEnv.createWithDefaults( {
	name: 'repo',
	specs: [ 'specs/repo/*.ts', 'specs/repo/extensions/*.ts' ],
	envFiles: [
		'../deploy/template.env',
		'../build/wikibase/build.env', // to compare actual MediaWiki version to build
		'./test-services.env',
		'../local.env'
	],
	composeFiles: [
		'../deploy/docker-compose.yml',
		'suites/docker-compose.override.yml',
		'suites/repo/docker-compose.override.yml'
	]
} );

export const config = wdioConfig( testEnv );
