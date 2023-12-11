import TestEnv from '../../setup/TestEnv.js';
import envVars from '../../setup/envVars.js';
import { defaultBeforeServices, defaultEnvFiles } from '../../setup/makeTestSettings.js';
import wdioConfig from '../../setup/wdio.conf.js';

// TODO: Explore what happened with WDQS in upgrade tests

export const testEnv = TestEnv.createWithDefaults( {
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
		`${envVars.WIKIBASE_URL}/wiki/Main_Page`
	] ),
	beforeServices: async ( testEnv ) => {
		const settings = testEnv.settings;
		const fromVersion = process.env.FROM_VERSION;
		const toVersion = process.env.TO_VERSION;

		settings.isBaseSuite = !(
			( toVersion && toVersion.includes( '_BUNDLE' ) ) ||
			( !toVersion && fromVersion.includes( '_BUNDLE' ) )
		);

		envVars.WIKIBASE_UPGRADE_TEST_IMAGE_URL = versions[ fromVersion ];
		console.log( `ℹ️  Using Wikibase Docker image: ${versions[ fromVersion ]}` );

		process.env.TO_VERSION = toVersion || `LOCAL_BUILD${settings.isBaseSuite ? '' : '_BUNDLE'}`;

		// Still load the default images as the local wikibase image will
		// be used in specs/upgrade/upgrade.ts#before where toVersion is used
		await defaultBeforeServices( testEnv );
	}
} );

export const config = wdioConfig( testEnv );
