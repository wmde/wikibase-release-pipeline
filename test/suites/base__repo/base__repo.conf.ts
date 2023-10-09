import { deepmerge } from 'deepmerge-ts';
import { config as wdioConf } from '../../wdio.conf';

export const config = deepmerge(
	wdioConf,
	{
		specs: [
			'../../specs/repo/api.js',
			'../../specs/repo/api.ts',
			'../../specs/repo/property.js',
			'../../specs/repo/property.ts',
			'../../specs/repo/special-item.js',
			'../../specs/repo/special-item.ts',
			'../../specs/repo/special-property.js',
			'../../specs/repo/special-property.ts',
			'../../specs/repo/queryservice.js',
			'../../specs/repo/queryservice.ts'
		]
	},
	{ clone: false }
);
