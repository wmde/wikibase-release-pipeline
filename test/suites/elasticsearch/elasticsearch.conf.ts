import { deepmerge } from 'deepmerge-ts';
import { config as wdioConf } from '../../wdio.conf';

export const config = deepmerge(
	wdioConf,
	{ specs: [ '../../specs/elasticsearch/*.js' ] },
	{ clone: false }
);
