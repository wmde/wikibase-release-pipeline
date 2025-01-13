import TestEnv from '../../setup/test-env.js';
import wdioConfig from '../../setup/wdio.conf.js';

export const testEnv = TestEnv.createWithDefaults( {
	name: 'repo-lts',
	specs: [ 'specs/repo/*.ts', 'specs/repo/extensions/*.ts' ],
	envFiles: [
		'../deploy-lts/template.env',
		'../build/wikibase-lts/build.env', // to compare actual MediaWiki version to build
		'./test-services.env',
		'../local.env'
	],
	composeFiles: [
		'../deploy-lts/docker-compose.yml',
		'suites/docker-compose.override.yml',
		'suites/docker-compose-lts.override.yml',
		'suites/repo/docker-compose.override.yml'
	]
} );

export const config = wdioConfig( testEnv );
