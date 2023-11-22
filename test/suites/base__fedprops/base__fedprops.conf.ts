import { DefaultTestSetup } from '../../helpers/TestSetup.js';
import { wdioConfig } from '../../wdio.conf.js';

export const specs = [
	'specs/fedprops/*.ts'
];

export const testSetup = new DefaultTestSetup( 'base__fedprops' );

export const config: WebdriverIO.Config = wdioConfig( testSetup, specs );
