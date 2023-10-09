import { deepmerge } from 'deepmerge-ts';
import { config as wdioConf } from '../../wdio.conf';

export const config = deepmerge(
	wdioConf,
	{
		specs: [
			'../../specs/repo/api.js',
			'../../specs/repo/api.ts',
			'../../specs/upgrade/pre-upgrade.js',
			'../../specs/upgrade/pre-upgrade.ts',
			'../../specs/upgrade/queryservice-pre-and-post-upgrade.js',
			'../../specs/upgrade/queryservice-pre-and-post-upgrade.ts'
		]
	},
	{ clone: false }
);
