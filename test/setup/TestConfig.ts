import WikibaseApi from 'wdio-wikibase/wikibase.api.js';
import { defaultFunctions as defaultFunctionsInit } from '../helpers/default-functions.js';
import loadEnvVars from './loadEnvVars.js';

export type TestSettings = {
	name: string,
	specs: string[],
	pwd: string,
	nameWithoutBase: string,
	isBaseSuite: boolean,
	outputDir: string,
	resultFilePath: string,
	screenshotPath: string,
	logLevel: string,
	testTimeout: number,
	waitForTimeout: number,
	baseUrl: string,
	runHeaded: boolean,
	dbUser: string,
	dbPass: string,
	dbName: string,
	dockerMysqlName: string,
	mwAdminName: string,
	mwAdminPass: string,
	mwServer: string,
	mwClientServer: string,
	qsServer: string,
	wdqsServer: string,
	elasticsearchServer: string,
	before( settings: TestSettings ): Promise<void>
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
	// mostly used by defaultFunctions
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
		this.settings.before = async (): Promise<void> => {
			defaultFunctionsInit( this.settings as TestSettings );

			await WikibaseApi.initialize(
				undefined,
				this.settings.mwAdminName,
				this.settings.mwAdminPass
			);
	
			if ( providedSettings.before ) {
				await providedSettings.before( this.settings as TestSettings );
			}
		}

		process.env.OUTPUT_DIR = this.settings.outputDir as string;
  }

	static getSettings( settings: Partial<TestSettings> ) {
		return new TestConfig( settings ).settings
	}
}
