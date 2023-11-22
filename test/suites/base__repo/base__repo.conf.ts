import { DefaultTestSetup } from '../../helpers/TestSetup.js';
import { wdioConfig } from '../../wdio.conf.js';

const specs = [
	'../../specs/repo/api.ts',
	'../../specs/repo/property.ts',
	'../../specs/repo/special-item.ts',
	'../../specs/repo/special-property.ts',
	'../../specs/repo/queryservice.ts'
];

export const testSetup = new DefaultTestSetup( 'base__repo' );

export const config: WebdriverIO.Config = wdioConfig( testSetup, specs );
