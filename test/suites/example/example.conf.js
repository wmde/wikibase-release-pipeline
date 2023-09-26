import { deepmerge } from 'deepmerge-ts';
import wdioConf from '../../wdio.conf.js';

export const config = deepmerge( wdioConf.config, {
	specs: [
		'./specs/quickstatements/*.js',
		'./specs/repo/queryservice.js',
		'./specs/elasticsearch/*.js'
	]
}, { clone: false } );
