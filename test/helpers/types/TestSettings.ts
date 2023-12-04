import { TestEnvironment } from '../../setup/TestEnvironment.js';
import { Frameworks } from '@wdio/types';

export type TestSuiteSettings = {
	name: string;
	isBaseSuite: boolean;
	specs: string[];
};

export type TestRunnerSettings = {
	runHeaded?: boolean;
	logLevel?: string;
	testTimeout?: number;
	waitForTimeout?: number;
	maxInstances: number;
	baseUrl: string;
	pwd: string;
	outputDir: string;
	resultFilePath: string;
	screenshotPath: string;
};

export type TestHooks = {
	// Runs immediately after environment is created but before it is ran
	onPrepare?( environment?: TestEnvironment ): Promise<void>;
	// Runs before services are started but after `outputDir` is
	// cleared and BEFORE existing services are stopped
	beforeServices?( environment?: TestEnvironment ): Promise<void>;
	// Runs after services are started
	afterServices?( environment?: TestEnvironment ): Promise<void>;
	// Runs after services are started and available (waitForItURLs all respond true)
	afterServicesAvailable?( environment?: TestEnvironment ): Promise<void>;
	// Runs once at the beginning of each spec file (before each WDIO runner)
	before?( environment?: TestEnvironment ): Promise<void>;
	// Runs before every Mocha "suite" (`describe` blocks)
	beforeMochaSuite?( mochaSuite: Frameworks.Suite, environment?: TestEnvironment ): Promise<void>;
	// Runs at the start of every WDIO worker
	beforeTest?( mochaTest: Frameworks.Test, environment?: TestEnvironment ): Promise<void>;
	// Runs at the end of every WDIO worker
	afterTest?( mochaTest: Frameworks.Test, environment?: TestEnvironment ): Promise<void>;
	// Runs after every Mocha "suite" (`describe` blocks)
	afterMochaSuite?( mochaSuite: Frameworks.Suite, environment?: TestEnvironment ): Promise<void>;
	// Runs once at the end of each spec file (after each WDIO runner)
	after?( environment?: TestEnvironment ): Promise<void>;
	// Executed after all workers have shut down and the process is about to exit
	onComplete?( environment?: TestEnvironment ): Promise<void>;
};

export type TestEnvironmentSettings = {
	composeFiles?: string[];
	waitForURLs?( environment?: TestEnvironment ): string[];
	envFiles?: string[];
};

export type TestSettings =
	TestSuiteSettings &
	TestRunnerSettings &
	TestHooks &
	TestEnvironmentSettings;

export default TestSettings;
