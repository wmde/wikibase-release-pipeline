import { deepmerge } from 'deepmerge-ts';
import { config as wdioConf } from '../../wdio.conf.js';

export const config = deepmerge(
	wdioConf,
	{
		specs: [
			'../../specs/repo/api.ts',
			'../../specs/upgrade/pre-upgrade.ts',
			'../../specs/upgrade/queryservice-pre-and-post-upgrade.ts'
		]
	},
	{ clone: false }
);
