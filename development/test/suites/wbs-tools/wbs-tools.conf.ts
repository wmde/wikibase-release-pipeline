import TestEnv from '../../setup/test-env.js';
import wdioConfig from '../../setup/wdio.conf.js';
import {
	INSTALLER_URL,
	INSTALL_TIMEOUT,
	collectDiagnostics,
	runBootstrapTest,
	startInstaller,
	stopInstaller
} from './test-environment.js';

export const testEnv = TestEnv.create( {
	name: 'wbs-tools',
	maxInstances: 1,
	specs: [ 'suites/wbs-tools/specs/install.ts' ],
	envFiles: [ './test-runner.env', '../local.env' ],
	composeFiles: [ 'suites/wbs-tools/docker-compose.override.yml' ],
	waitForUrls: () => [ 'http://browser:4444/wd/hub/status' ],
	onPrepare: async () => {
		try {
			runBootstrapTest();
			await testEnv.up();
			startInstaller();
		} catch ( error ) {
			collectDiagnostics();
			stopInstaller();
			await testEnv.down();
			throw error;
		}
	},
	before: () => Promise.resolve(),
	onComplete: async () => {
		collectDiagnostics();
		stopInstaller();
		await testEnv.down();
	}
} );

export const config = wdioConfig( testEnv );
config.baseUrl = INSTALLER_URL;
config.waitforTimeout = 30000;
config.connectionRetryTimeout = 120000;
config.mochaOpts = {
	ui: 'bdd',
	timeout: INSTALL_TIMEOUT
};
if ( config.capabilities ) {
	config.capabilities = config.capabilities.map( ( capability ) => ( {
		...capability,
		acceptInsecureCerts: true
	} ) );
}
