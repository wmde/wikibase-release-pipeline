import { deepmerge } from 'deepmerge-ts';
import { config as wdioConf } from '../../wdio.conf.js';

export const config = deepmerge(
	wdioConf,
	{
		specs: [
			'../../specs/repo_client/*.ts',
			'../../specs/repo_client/extensions/*.ts'
		]
	},
	{ clone: false }
);
