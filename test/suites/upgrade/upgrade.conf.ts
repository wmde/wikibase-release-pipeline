import { TestSetup } from '../../helpers/TestSetup.js';
import { wdioConfig } from '../../wdio.conf.js';

export const versions = {
	WMDE9: 'wikibase/wikibase:1.37.6-wmde.9',
	WMDE9_BUNDLE: 'wikibase/wikibase-bundle:1.37.6-wmde.9',

	WMDE10: 'wikibase/wikibase-bundle:1.38.5-wmde.10',
	WMDE10_BUNDLE: 'wikibase/wikibase:1.38.5-wmde.10',

	WMDE11: 'wikibase/wikibase:1.39.1-wmde.11',
	WMDE11_BUNDLE: 'wikibase/wikibase-bundle:1.39.1-wmde.11',

	WMDE12: 'wikibase/wikibase-bundle:1.38.7-wmde.12',
	WMDE12_BUNDLE: 'wikibase/wikibase:1.38.7-wmde.12',

	WMDE13: 'wikibase/wikibase-bundle:1.39.5-wmde.13',
	WMDE13_BUNDLE: 'wikibase/wikibase:1.39.5-wmde.13'
};

const upgradeFromVersion = process.env.UPGRADE_FROM_VERSION;
const wikibaseImageName = versions[ upgradeFromVersion ];
// TODO: Doing this here and not loading /variables.env as there
// is currently no elegant way to override WIKIBASE_TEST_IMAGE_NAME
// from the TestSetupConfig. There is likely be a better solution.
process.env.WIKIBASE_TEST_IMAGE_NAME = wikibaseImageName;

export const specs = [
	'specs/upgrade/pre-upgrade.ts',
	'specs/upgrade/queryservice-pre-and-post-upgrade.ts',
	'specs/upgrade/upgrade.ts',
	'specs/upgrade/queryservice-pre-and-post-upgrade.ts',
	'specs/upgrade/queryservice-post-upgrade.ts'
];

export const testSetup = new TestSetup( 'upgrade', {
	composeFiles: [
		'suites/upgrade/docker-compose.yml'
		// TODO: Explore further what happened with WDQS
		// 'suites/upgrade/docker-compose.wdqs.yml'
	],
	envFiles: [
		'suites/upgrade/default_variables.env'
	],
	waitForURLs: [
		`${process.env.MW_SERVER}/wiki/Main_Page`
	],
	skipLocalDockerImageLoad: true
} );

export const config: WebdriverIO.Config = wdioConfig( testSetup, specs );
