import { DefaultTestSetup } from '../../helpers/TestSetup.js';
import { wdioConfig } from '../../wdio.conf.js';

const specs = [
	'../../specs/repo_client/interwiki-links.ts',
	'../../specs/repo_client/item.ts',
	'../../specs/repo/api.ts'
];

export const testSetup = new DefaultTestSetup( 'base__repo_client' );

export const config: WebdriverIO.Config = wdioConfig( testSetup, specs );
