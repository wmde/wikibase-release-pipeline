import TestEnv from '../../setup/test-env.js';
import wdioConfig from '../../setup/wdio.conf.js';

export const testEnv = TestEnv.createWithDefaults( {
	name: 'fedprops',
	specs: [ 'specs/fedprops/*.ts' ],
	envFiles: [
		'../deploy/template.env',
		// TODO: For MEDIAWIKI_VERSION only. Could use this Action API endpoint
		// instead to remove dependency:
		// https://wikibase/api.php?action=query&meta=siteinfo&siprop=general
		// Returns JSON and version is available at the query.general.generator key
		'../build/wikibase/build.env',
		'./test-services.env',
		'../local.env'
	],
	composeFiles: [
		'../deploy/docker-compose.yml',
		'suites/docker-compose.override.yml',
		'suites/fedprops/docker-compose.override.yml'
	]
} );

export const config = wdioConfig( testEnv );
