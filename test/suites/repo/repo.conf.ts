import { TestEnvironment } from "../../setup/TestEnvironment.js";
import wdioConfig from "../../setup/wdio.conf.js";

export const environment = TestEnvironment.createAppendingToDefaults( {
	name: 'repo',
	specs: [
		'specs/repo/*.ts',
		'specs/repo/extensions/*.ts'
	],
	composeFiles: [
		'suites/repo/docker-compose.override.yml'
	]
} );

export const config = wdioConfig( environment );
