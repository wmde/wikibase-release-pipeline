import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defaultSettings } from '../_setup/make-test-settings.js';
import TestEnv from '../_setup/test-env.js';
import wdioConfig from '../_setup/wdio.conf.js';

export const testEnv = TestEnv.create({
	...defaultSettings,
	name: 'upgrade',
	maxInstances: 1,
	specs: [ 'upgrade/*.spec.ts' ],
	composeFiles: [
		...( defaultSettings.composeFiles ?? [] ),
		'upgrade/docker-compose.override.yml'
	],
	prepareConfigurationDirectory: ( configurationDirectory: string ): void => {
		copyFileSync(
			new URL( './fixtures/wbs-7/LocalSettings.php', import.meta.url ),
			resolve( configurationDirectory, 'LocalSettings.php' )
		);
	}
} );

export const config = wdioConfig( testEnv );
