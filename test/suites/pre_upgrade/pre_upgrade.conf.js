import { deepmerge } from 'deepmerge-ts';
import { config as wdioConf } from '../../wdio.conf.js';

export const config = deepmerge(
	wdioConf,
	{
		specs: [
			'./specs/repo/api.js',
			'./specs/upgrade/pre-upgrade.js',
			'./specs/upgrade/queryservice-pre-and-post-upgrade.js'
		]
	},
	{ clone: false }
);
