import { ltsSettings } from '../../setup/make-test-settings.js';
import TestEnv from '../../setup/test-env.js';
import wdioConfig from '../../setup/wdio.conf.js';

export const testEnv = TestEnv.create( {
	...ltsSettings,
	name: 'repo-lts',
	specs: [ 'specs/repo/*.ts', 'specs/repo/extensions/*.ts' ],
	envFiles: [
		...ltsSettings.envFiles,
		'../build/wikibase/build.env' // to compare actual MediaWiki version to build
	],
	composeFiles: [
		...ltsSettings.composeFiles,
		'suites/repo/docker-compose.override.yml'
	]
} );

export const config = wdioConfig( testEnv );
