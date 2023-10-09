import { deepmerge } from 'deepmerge-ts';
import { config as wdioConf } from '../../wdio.conf';

export const config = deepmerge(
	wdioConf,
	{ specs: [ '../../specs/confirm_edit/*.js' , '../../specs/confirm_edit/*.ts' ] },
	{ clone: false }
);
