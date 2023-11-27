import { TestSetup } from '../../helpers/TestSetup.js';
import { defaultTestSetupConfig } from '../../helpers/DefaultTestSetup.js';
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

export const specs = [
	'specs/upgrade/pre-upgrade.ts',
	'specs/upgrade/queryservice-pre-and-post-upgrade.ts',
	'specs/upgrade/upgrade.ts',
	'specs/upgrade/queryservice-pre-and-post-upgrade.ts',
	'specs/upgrade/queryservice-post-upgrade.ts'
];

process.env.WIKIBASE_UPGRADE_TEST_IMAGE = versions[ process.env.UPGRADE_FROM_VERSION ];

export const testSetup = new TestSetup( 'upgrade', {
	composeFiles: [
		'suites/upgrade/docker-compose.yml'
		// TODO: Explore further what happened with WDQS
		// 'suites/upgrade/docker-compose.wdqs.yml'
	],
	envFiles: [
		...defaultTestSetupConfig.envFiles,
		'suites/upgrade/default_variables.env'
	],
	waitForURLs: () => ( [
		`${process.env.MW_SERVER}/wiki/Main_Page`
	] ),
	beforeServices: defaultTestSetupConfig.beforeServices,
	before: defaultTestSetupConfig.before
} );

export const config: WebdriverIO.Config = wdioConfig( testSetup, specs );
