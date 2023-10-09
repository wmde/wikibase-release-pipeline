import { deepmerge } from 'deepmerge-ts';
import { config as wdioConf } from '../../wdio.conf';

export const config = deepmerge(
	wdioConf,
	{
		specs: [
			'../../specs/repo_client/interwiki-links.js',
			'../../specs/repo_client/item.js',
			'../../specs/repo/api.js'
		]
	},
	{ clone: false }
);
