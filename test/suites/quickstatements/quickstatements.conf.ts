import { deepmerge } from 'deepmerge-ts';
import { config as wdioConf } from '../../wdio.conf.ts';

export const config = deepmerge(
	wdioConf,
	{
		specs: [
			'../../specs/repo_client/interwiki-links.js',
			'../../specs/quickstatements/*.js'
		]
	},
	{ clone: false }
);
