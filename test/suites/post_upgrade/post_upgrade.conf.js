import { deepmerge } from 'deepmerge-ts';
import wdioConf from '../../wdio.conf.js';

export const config = deepmerge( wdioConf.config, {
	specs: [
		'./specs/repo/api.js',
		'./specs/upgrade/post-upgrade.js',
		'./specs/upgrade/queryservice-pre-and-post-upgrade.js',
		'./specs/upgrade/queryservice-post-upgrade.js'
	]
}, { clone: false } );
