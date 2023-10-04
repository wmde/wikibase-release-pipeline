import { deepmerge } from 'deepmerge-ts';
import { config as wdioConf } from '../../wdio.conf.ts';

export const config = deepmerge(
	wdioConf,
	{
		specs: [ '../../specs/repo/*.js', '../../specs/repo/extensions/*.js' ]
	},
	{ clone: false }
);
