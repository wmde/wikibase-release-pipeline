import { deepmerge } from 'deepmerge-ts';
import wdioConf from '../../wdio.conf.js';

export const config = deepmerge( wdioConf.config, {
	specs: [
		'./specs/repo_client/interwiki-links.js',
		'./specs/repo_client/item.js',
		'./specs/repo/api.js'
	]
}, { clone: false } );
