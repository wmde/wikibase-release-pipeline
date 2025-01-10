import TestEnv from '../../setup/test-env.js';
import wdioConfig from '../../setup/wdio.conf.js';

export const testEnv = TestEnv.createWithDefaults( {
	name: 'pingback-lts',
	specs: [ 'specs/pingback/*.ts' ],
	envFiles: [
		'../deploy-lts/template.env',
		// TODO: For MEDIAWIKI_VERSION only. Could use this Action API endpoint
		// instead to remove dependency:
		// https://wikibase/api.php?action=query&meta=siteinfo&siprop=general
		// Returns JSON and version is available at the query.general.generator key
		'../build/wikibase-lts/build.env',
		'./test-services.env',
		'../local.env'
	],
	composeFiles: [
		'../deploy/docker-compose.yml',
		'suites/docker-compose.override.yml',
		'suites/docker-compose-lts.override.yml',
		'suites/pingback/docker-compose.override.yml'
	]
} );

export const config = wdioConfig( testEnv );
