import { deepmerge } from 'deepmerge-ts';
import wdioConf from '../../wdio.conf.js';

export const config = deepmerge( wdioConf.config, {
	specs: [
		'./specs/repo_client/interwiki-links.js',
		'./specs/quickstatements/*.js'
	]
}, { clone: false } );
