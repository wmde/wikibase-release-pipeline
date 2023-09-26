import { deepmerge } from 'deepmerge-ts';
import wdioConf from '../../wdio.conf.js';

export const config = deepmerge( wdioConf.config, {
	specs: [ './specs/repo/*.js', './specs/repo/extensions/*.js' ]
}, { clone: false } );
