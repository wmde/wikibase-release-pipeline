import TestEnv from '../../setup/TestEnv.js';
import { defaultBeforeServices, defaultEnvFiles } from '../../setup/makeTestSettings.js';
import wdioConfig from '../../setup/wdio.conf.js';
import versions from './versions.js';

// TODO: Explore what happened with WDQS in upgrade tests

global.testEnv = TestEnv.createWithDefaults( {
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
		`${testEnv.vars.WIKIBASE_URL}/wiki/Main_Page`
	] ),
	beforeServices: async () => {
		const fromVersion = process.env.FROM_VERSION;
		const toVersion = process.env.TO_VERSION;

		testEnv.settings.isBaseSuite = !(
			( toVersion && toVersion.includes( '_BUNDLE' ) ) ||
			( !toVersion && fromVersion.includes( '_BUNDLE' ) )
		);

		testEnv.vars.WIKIBASE_UPGRADE_TEST_IMAGE_URL = versions[ fromVersion ];
		console.log( `ℹ️  Upgrading FROM Wikibase Docker image: ${versions[ fromVersion ]}` );

		process.env.TO_VERSION = toVersion ||
			`LOCAL_BUILD${testEnv.settings.isBaseSuite ? '' : '_BUNDLE'}`;

		// Still load the default images as the local wikibase image will
		// be used in specs/upgrade/upgrade.ts#before where toVersion is used
		await defaultBeforeServices();
	}
} );

export const config = wdioConfig();
