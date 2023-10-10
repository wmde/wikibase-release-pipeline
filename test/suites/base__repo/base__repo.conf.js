import { deepmerge } from 'deepmerge-ts';
import { config as wdioConf } from '../../wdio.conf.js';

export const config = deepmerge(
	wdioConf,
	{
		specs: [
			'../../specs/repo/api.js',
			'../../specs/repo/property.js',
			'../../specs/repo/special-item.js',
			'../../specs/repo/special-property.js',
			'../../specs/repo/queryservice.js'
		]
	},
	{ clone: false }
);
