import { TestEnvironment } from './TestEnvironment.js';
import loadEnvVars from './loadEnvVars.js';
import { Frameworks } from '@wdio/types';

export type TestSettings = {
	name: string,
	nameWithoutBase: string,
	specs: string[],
	runHeaded: boolean,
	logLevel: string,
	testTimeout: number,
	waitForTimeout: number,
	isBaseSuite: boolean,
	
	// TODO: Is only used in TestEnvironment when creating results path. Maybe move there.
	pwd: string,
	outputDir: string,
	resultFilePath: string,
	screenshotPath: string,

	// TODO: Used only by defaultFunctions#dockerExecute which should be moved to TestEnvironment
	dockerMysqlName: string,
	
	// Used mostly in tests (directly or via defaultFunction)
	dbUser: string,
	dbPass: string,
	dbName: string,
	mwAdminName: string,
	mwAdminPass: string,
	baseUrl: string,
	mwServer: string,
	mwClientServer: string,
	qsServer: string,
	wdqsServer: string,
	elasticsearchServer: string,

	// WDIO test runner / Mocha Hooks
	// Runs once at the beginning of each spec file (before each WDIO runner)
	before( settings?: TestSettings, environment?: TestEnvironment ): Promise<void>,
	// Runs before every Mocha "suite" (`describe` blocks)
	// * the same as `before` if there is only one `describe` block in each file
	beforeMochaSuite( mochaSuite: Frameworks.Suite, settings?: TestSettings, environment?: TestEnvironment ): Promise<void>,
	// Runs at the start of every WDIO worker
	beforeTest( mochaTest: Frameworks.Test ): Promise<void>,
	// Runs at the end of every WDIO worker
	afterTest( mochaTest: Frameworks.Test ): Promise<void>, 
	// Runs after every Mocha "suite" (`describe` blocks)
	// * the same as `after` if there is only one `describe` block in each file
	afterMochaSuite( mochaSuite: Frameworks.Suite, settings?: TestSettings, environment?: TestEnvironment ): Promise<void>,
	// Runs once at the end of each spec file (after each WDIO runner)
	after( settings?: TestSettings, environment?: TestEnvironment ): Promise<void>
}

loadEnvVars( './setup/default.env' );
loadEnvVars( '../local.env' );

export const defaultTestSettings: Partial<TestSettings> = {
	pwd: process.env.HOST_PWD,
	logLevel: process.env.SELENIUM_LOG_LEVEL,
	testTimeout: parseInt( process.env.MOCHA_OPTS_TIMEOUT ) || 90 * 1000,
	waitForTimeout: 30 * 1000,
	baseUrl: process.env.MW_SERVER + process.env.MW_SCRIPT_PATH,
	runHeaded: !!process.env.HEADED_TESTS,
	// mostly used in defaultFunctions and within specs
	dbUser: process.env.DB_USER,
	dbPass: process.env.DB_PASS,
	dbName: process.env.DB_NAME,
	dockerMysqlName: process.env.DOCKER_MYSQL_NAME,
	mwAdminName: process.env.MW_ADMIN_NAME,
	mwAdminPass: process.env.MW_ADMIN_PASS,
	mwServer: process.env.MW_SERVER,
	mwClientServer: process.env.MW_CLIENT_SERVER,
	qsServer: process.env.QS_SERVER,
	wdqsServer: process.env.WDQS_SERVER,
	elasticsearchServer: `http://${process.env.MW_ELASTIC_HOST}:${process.env.MW_ELASTIC_PORT}`
};

export class TestConfig {
  public settings: TestSettings;
  
	public constructor( providedSettings: Partial<TestSettings> ) {
    const settings = { ...defaultTestSettings, ...providedSettings } as Partial<TestSettings>;

    this.settings = settings as TestSettings;
		this.settings.nameWithoutBase = settings.name.replace( 'base__', '' );
		this.settings.isBaseSuite = settings.name !== this.settings.nameWithoutBase;
		this.settings.outputDir = `suites/${settings.name}/results`;
		this.settings.resultFilePath = `${this.settings.outputDir}/result.json`;
		this.settings.screenshotPath = `${this.settings.outputDir}/screenshots`;

		process.env.OUTPUT_DIR = this.settings.outputDir as string;
  }

	static getSettings( settings: Partial<TestSettings> ) {
		return new TestConfig( settings ).settings
	}
}
