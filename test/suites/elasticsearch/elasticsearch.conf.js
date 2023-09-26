import { deepmerge } from 'deepmerge-ts';
import wdioConf from '../../wdio.conf.js';

export const config = deepmerge( wdioConf.config, { specs: [ './specs/elasticsearch/*.js' ] }, { clone: false } );
