import { deepmerge } from 'deepmerge-ts';
import { config as wdioConf } from '../../wdio.conf';

export const config = deepmerge(
	wdioConf,
	{
		specs: [
			'../../specs/repo_client/*.js',
			'../../specs/repo_client/*.ts',
			'../../specs/repo_client/extensions/*.js',
			'../../specs/repo_client/extensions/*.ts'
		]
	},
	{ clone: false }
);
