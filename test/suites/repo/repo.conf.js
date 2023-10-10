import { deepmerge } from 'deepmerge-ts';
import { config as wdioConf } from '../../wdio.conf.js';

export const config = deepmerge(
	wdioConf,
	{
		// specs: [ '../../specs/repo/*.js', '../../specs/repo/extensions/*.js' ]
		specs: [ '../../specs/repo/extensions/nuke.js' ]
	},
	{ clone: false }
);
