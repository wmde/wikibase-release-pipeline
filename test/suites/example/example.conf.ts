import { deepmerge } from 'deepmerge-ts';
import { config as wdioConf } from '../../wdio.conf';

export const config = deepmerge(
	wdioConf,
	{
		specs: [
			'../../specs/quickstatements/*.js',
			'../../specs/quickstatements/*.ts',
			'../../specs/repo/queryservice.js',
			'../../specs/repo/queryservice.ts',
			'../../specs/elasticsearch/*.js',
			'../../specs/elasticsearch/*.ts'
		]
	},
	{ clone: false }
);
