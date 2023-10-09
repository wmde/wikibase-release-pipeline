import { deepmerge } from 'deepmerge-ts';
import { config as wdioConf } from '../../wdio.conf';

export const config = deepmerge(
	wdioConf,
	{ specs: [ '../../specs/fedprops/*.js',  '../../specs/fedprops/*.ts' ] },
	{ clone: false }
);
