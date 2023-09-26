import { deepmerge } from 'deepmerge-ts';
import { config as wdioConf } from '../../wdio.conf.js';

export const config = deepmerge(
	wdioConf,
	{
		specs: [
			'./specs/quickstatements/*.js',
			'./specs/repo/queryservice.js',
			'./specs/elasticsearch/*.js'
		]
	},
	{ clone: false }
);
