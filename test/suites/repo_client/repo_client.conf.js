import { deepmerge } from 'deepmerge-ts';
import wdioConf from '../../wdio.conf.js';

export const config = deepmerge( wdioConf.config, {
	specs: [ './specs/repo_client/*.js', './specs/repo_client/extensions/*.js' ]
}, { clone: false } );
