import { deepmerge } from 'deepmerge-ts';
import wdioConf from '../../wdio.conf.js';

export const config = deepmerge( wdioConf.config, {
	specs: [
		'./specs/repo/api.js',
		'./specs/repo/property.js',
		'./specs/repo/special-item.js',
		'./specs/repo/special-property.js',
		'./specs/repo/queryservice.js'
	]
}, { clone: false } );
