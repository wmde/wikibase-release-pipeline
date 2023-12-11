import TestEnv from '../../setup/TestEnv.js';
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
	// Runs immediately after testEnv is created but before it is ran
	onPrepare?( testEnv?: TestEnv ): Promise<void>;
	// Runs before services are started but after `outputDir` is
	// cleared and BEFORE existing services are stopped
	beforeServices?( testEnv?: TestEnv ): Promise<void>;
	// Runs after services are started
	afterServices?( testEnv?: TestEnv ): Promise<void>;
	// Runs after services are started and available (waitForItURLs all respond true)
	afterServicesAvailable?( testEnv?: TestEnv ): Promise<void>;
	// Runs once at the beginning of each spec file (before each WDIO runner)
	before?( testEnv?: TestEnv ): Promise<void>;
	// Runs before every Mocha "suite" (`describe` blocks)
	beforeMochaSuite?( mochaSuite: Frameworks.Suite, testEnv?: TestEnv ): Promise<void>;
	// Runs at the start of every WDIO worker
	beforeTest?( mochaTest: Frameworks.Test, testEnv?: TestEnv ): Promise<void>;
	// Runs at the end of every WDIO worker
	afterTest?( mochaTest: Frameworks.Test, testEnv?: TestEnv ): Promise<void>;
	// Runs after every Mocha "suite" (`describe` blocks)
	afterMochaSuite?( mochaSuite: Frameworks.Suite, testEnv?: TestEnv ): Promise<void>;
	// Runs once at the end of each spec file (after each WDIO runner)
	after?( testEnv?: TestEnv ): Promise<void>;
	// Executed after all workers have shut down and the process is about to exit
	onComplete?( testEnv?: TestEnv ): Promise<void>;
};

export type TestEnvSettings = {
	composeFiles?: string[];
	waitForURLs?( testEnv?: TestEnv ): string[];
	envFiles?: string[];
};

export type TestSettings =
	TestSuiteSettings &
	TestRunnerSettings &
	TestHooks &
	TestEnvSettings;

export default TestSettings;
