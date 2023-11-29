import { mkdirSync, rmSync } from 'fs';
import { SevereServiceError } from 'webdriverio';
import testLog from './testLog.js';

export type TestConfigSettings = {
  name: string;
	before?(): Promise<void>;
	// Can configure headed runs for the test environment directly,
	// or globally by setting the HEADED_TESTS env var
	runHeaded?: boolean;
  pwd?: string;
};

// if ( this.runHeaded ) {
//   console.log(
//     '💻 Open http://localhost:7900/?autoconnect=1&resize=scale&password=secret to observe headed tests.\n'
//   );
// }

export class TestConfig {
	public isBaseSuite: boolean;
	public outputDir: string;
	public resultFilePath: string;
	public screenshotPath: string;
	public name: string;
	public suiteConfigName: string;
	public runHeaded: boolean;
	protected settings: TestConfigSettings;
	protected pwd: string;

	public constructor( settings: TestConfigSettings ) {
		this.name = settings.name;
		this.suiteConfigName = this.name.replace( 'base__', '' );
		process.env.SUITE = this.name;
		process.env.SUITE_CONFIG_NAME = this.suiteConfigName;
		this.isBaseSuite = this.name !== this.suiteConfigName;

		this.settings = settings;
		this.runHeaded = this.settings.runHeaded || !!process.env.HEADED_TESTS;
		this.pwd = settings.pwd || process.env.HOST_PWD || process.env.PWD;
		this.outputDir = `suites/${this.name}/results`;
		this.screenshotPath = `${this.outputDir}/screenshots`;
		this.resultFilePath = `${this.outputDir}/result.json`;
	}

	public async execute(): Promise<void> {
		try {
			this.setupOutputDir();
		} catch ( e ) {
			throw new SevereServiceError( e );
		}
	}

	public async before(): Promise<void> {
		if ( this.settings.before ) {
			await this.settings.before();
		}
	}

	private setupOutputDir(): void {
		try {
			rmSync( this.outputDir, { recursive: true, force: true } );
			// eslint-disable-next-line security/detect-non-literal-fs-filename
			mkdirSync( this.outputDir, { recursive: true } );
		} catch ( e ) {
			testLog.error( '❌ Error occurred in setting-up logs:', e );
		}
	}
}
