import { deepmerge } from 'deepmerge-ts';
import { config as wdioConf } from '../../wdio.conf.js';

export const config = deepmerge(
	wdioConf,
	{ specs: [ '../../specs/confirm_edit/*.js' ] },
	{ clone: false }
);
