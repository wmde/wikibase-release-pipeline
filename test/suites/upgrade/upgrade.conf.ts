import TestEnv from '../../setup/TestEnv.js';
import { defaultTestSettings } from '../../setup/makeTestSettings.js';
import wdioConfig from '../../setup/wdio.conf.js';
import versions from './versions.js';

export const testEnv = TestEnv.createWithDefaults( {
	name: 'upgrade',
	specs: [ 'specs/upgrade/pre-upgrade.ts', 'specs/upgrade/upgrade.ts' ],
	composeFiles: [ 'suites/upgrade/docker-compose.yml' ],
	envFiles: [ ...defaultTestSettings.envFiles, 'suites/upgrade/upgrade.env' ],
	beforeServices: async () => {
		const fromVersion = process.env.FROM_VERSION;
		const toVersion = process.env.TO_VERSION;

		testEnv.settings.isBaseSuite = !(
			( toVersion && toVersion.includes( '_BUNDLE' ) ) ||
			( !toVersion && fromVersion.includes( '_BUNDLE' ) )
		);

		testEnv.vars.WIKIBASE_UPGRADE_TEST_IMAGE_URL = versions[ fromVersion ];
		console.log(
			`ℹ️  Upgrading FROM Wikibase Docker image: ${ versions[ fromVersion ] }`
		);

		process.env.TO_VERSION =
			toVersion ||
			`LOCAL_BUILD${ testEnv.settings.isBaseSuite ? '' : '_BUNDLE' }`;

		// Still load the default images as the local wikibase image will
		// be used in specs/upgrade/upgrade.ts#before where `toVersion` is used
		await defaultTestSettings.beforeServices();
	}
} );

export const config = wdioConfig( testEnv );
