import { deepmerge } from 'deepmerge-ts';
import wdioConf from '../../wdio.conf.js';

export const config = deepmerge( wdioConf.config, { specs: [ './specs/confirm_edit/*.js' ] }, { clone: false } );
