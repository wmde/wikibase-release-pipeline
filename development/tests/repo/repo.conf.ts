import { readFileSync } from 'node:fs';
import { readBakeValue } from '../../lib/bake.js';
import { defaultSettings } from '../_setup/make-test-settings.js';
import TestEnv from '../_setup/test-env.js';
import wdioConfig from '../_setup/wdio.conf.js';

export const testEnv = TestEnv.create({
	...defaultSettings,
	name: 'repo',
	maxInstances: 3,
	specs: ['repo/*.spec.ts']
});

testEnv.settings.vars.MEDIAWIKI_VERSION = readBakeValue(
	readFileSync(
		new URL('../../images/wikibase/docker-bake.hcl', import.meta.url),
		'utf8'
	),
	'MEDIAWIKI',
	'version'
);

export const config = wdioConfig(testEnv);
