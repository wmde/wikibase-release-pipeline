import { deepmerge } from 'deepmerge-ts';
import wdioConf from '../../wdio.conf.js';

export const config = deepmerge( wdioConf.config, {
	specs: [
		'./specs/repo/api.js',
		'./specs/upgrade/pre-upgrade.js',
		'./specs/upgrade/queryservice-pre-and-post-upgrade.js'
	]
}, { clone: false } );
