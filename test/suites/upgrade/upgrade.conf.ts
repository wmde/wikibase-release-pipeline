import { TestEnvironment } from '../../setup/TestEnvironment.js';
import { defaultBeforeServices, defaultEnvFiles } from '../../setup/makeTestSettings.js';
import wdioConfig from '../../setup/wdio.conf.js';

// TODO: Explore what happened with WDQS in upgrade tests

export const versions = {
	WMDE9: 'wikibase/wikibase:1.37.6-wmde.9',
	WMDE9_BUNDLE: 'wikibase/wikibase-bundle:1.37.6-wmde.9',

	WMDE10: 'wikibase/wikibase:1.38.5-wmde.10',
	WMDE10_BUNDLE: 'wikibase/wikibase-bundle:1.38.5-wmde.10',

	WMDE11: 'wikibase/wikibase:1.39.1-wmde.11',
	WMDE11_BUNDLE: 'wikibase/wikibase-bundle:1.39.1-wmde.11',

	WMDE12: 'wikibase/wikibase:1.38.7-wmde.12',
	WMDE12_BUNDLE: 'wikibase/wikibase-bundle:1.38.7-wmde.12',

	WMDE13: 'wikibase/wikibase:1.39.5-wmde.13',
	WMDE13_BUNDLE: 'wikibase/wikibase-bundle:1.39.5-wmde.13',

	LOCAL_BUILD: 'wikibase/wikibase',
	LOCAL_BUILD_BUNDLE: 'wikibase/wikibase-bundle'
};

export const environment = TestEnvironment.createWithDefaults( {
	name: 'upgrade',
	specs: [
		'specs/upgrade/pre-upgrade.ts',
		// 'specs/upgrade/queryservice-pre-and-post-upgrade.ts',
		'specs/upgrade/upgrade.ts'
		// 'specs/upgrade/queryservice-pre-and-post-upgrade.ts',
		// 'specs/upgrade/queryservice-post-upgrade.ts'
	],
	composeFiles: [
		'suites/upgrade/docker-compose.yml'
		// 'suites/upgrade/docker-compose.wdqs.yml'
	],
	envFiles: [
		...defaultEnvFiles,
		'suites/upgrade/upgrade.env'
	],
	waitForURLs: () => ( [
		`${globalThis.env.WIKIBASE_URL}/wiki/Main_Page`
	] ),
	beforeServices: async ( testEnv ) => {
		const settings = testEnv.settings;
		const fromVersion = process.env.FROM_VERSION;
		const toVersion = process.env.TO_VERSION;

		settings.isBaseSuite = !(
			( toVersion && toVersion.includes( '_BUNDLE' ) ) ||
			( !toVersion && fromVersion.includes( '_BUNDLE' ) )
		);

		globalThis.env.WIKIBASE_UPGRADE_TEST_IMAGE_URL = versions[ fromVersion ];
		console.log( `ℹ️  Using Wikibase Docker image: ${versions[ fromVersion ]}` );

		process.env.TO_VERSION = toVersion || `LOCAL_BUILD${settings.isBaseSuite ? '' : '_BUNDLE'}`;

		// Still load the default images as the local wikibase image will
		// be used in specs/upgrade/upgrade.ts#before where toVersion is used
		await defaultBeforeServices( testEnv );
	}
} );

export const config = wdioConfig( environment );
