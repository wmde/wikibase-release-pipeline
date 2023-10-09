import { deepmerge } from 'deepmerge-ts';
import { config as wdioConf } from '../../wdio.conf';

export const config = deepmerge(
	wdioConf,
	{ specs: [ '../../specs/pingback/*.js', '../../specs/pingback/*.ts' ] },
	{ clone: false }
);
