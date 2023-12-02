import { TestEnvironment } from './TestEnvironment.js';
import { Frameworks } from '@wdio/types';

export type TestSuiteSettings = {
	name: string,
	nameWithoutBase: string,
	isBaseSuite: boolean,
	specs: string[]
}

export type TestRunnerSettings = {
	runHeaded?: boolean,
	logLevel?: string,
	testTimeout?: number,
	waitForTimeout?: number,
	baseUrl: string,
	pwd: string,
	outputDir: string,
	resultFilePath: string,
	screenshotPath: string
}

export type TestHooks = {
	// == TestEnvironment Hooks
	// Runs before services are started. Runs in WDIO `onPrepare` after `outputDir` is cleared and BEFORE existing services are stopped.
	// If using defaults this will run after local images are loaded.
	beforeServices?( settings: TestSettings ): void,
	// Runs after services are started
	afterServices?( settings: TestSettings ): void,
	// Runs after services are started and available (waitForItURLs all respond true)
	afterServicesAvailable?( settings: TestSettings ): void,

	// == WDIO test runner / Mocha Hooks
	// Runs once at the beginning of each spec file (before each WDIO runner)
	before?( settings?: TestSettings, environment?: TestEnvironment ): Promise<void>,
	// Runs before every Mocha "suite" (`describe` blocks)
	beforeMochaSuite?( mochaSuite: Frameworks.Suite, settings?: TestSettings, environment?: TestEnvironment ): Promise<void>,
	// Runs at the start of every WDIO worker
	beforeTest?( mochaTest: Frameworks.Test ): Promise<void>,
	// Runs at the end of every WDIO worker
	afterTest?( mochaTest: Frameworks.Test ): Promise<void>, 
	// Runs after every Mocha "suite" (`describe` blocks)
	afterMochaSuite?( mochaSuite: Frameworks.Suite, settings?: TestSettings, environment?: TestEnvironment ): Promise<void>,
	// Runs once at the end of each spec file (after each WDIO runner)
	after?( settings?: TestSettings, environment?: TestEnvironment ): Promise<void>
}

export type TestEnvironmentSettings = {
	composeFiles?: string[],
	waitForURLs?( settings: TestSettings ): string[],
	envFiles?: string[]
};

export type TestSettings =
	TestSuiteSettings &
	TestRunnerSettings &
	TestServiceSettings &
	TestHooks &
	TestEnvironmentSettings

export default TestSettings;
