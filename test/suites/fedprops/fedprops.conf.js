import { deepmerge } from 'deepmerge-ts';
import { config as wdioConf } from '../../wdio.conf.js';

export const config = deepmerge(
	wdioConf,
	{ specs: [ './specs/fedprops/*.js' ] },
	{ clone: false }
);
