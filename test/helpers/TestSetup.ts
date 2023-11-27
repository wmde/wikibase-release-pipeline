import { mkdirSync, rmSync } from 'fs';
import { spawnSync } from 'child_process';
import { SevereServiceError } from 'webdriverio';
import logger from '@wdio/logger';
import checkIfUp from './checkIfUp.js';
import loadEnvVars from './loadEnvVars.js';

export const testSetupLog = logger( 'TestSetup' );

export type TestSetupConfig = {
	envFiles?: string[];
	composeFiles?: string[];
	waitForURLs?(): string[];
	before?(): Promise<void>;
	beforeServices?( isBaseSuite: boolean ): void;
	// Can configure headed runs for the test environment directly,
	// or globally by setting the HEADED_TESTS env var
	runHeaded?: boolean;
};

export class TestSetup {
	protected config: TestSetupConfig;
	protected hostCWD: string;
	protected testLogFilePath: string;
	public baseDockerComposeCmd: string;
	public isBaseSuite: boolean;
	public outputDir: string;
	public resultFilePath: string;
	public screenshotPath: string;
	public suiteName: string;
	public suiteConfigName: string;
	public runHeaded: boolean;

	public constructor(
		suiteName: string,
		config: TestSetupConfig = {}
	) {
		this.suiteName = suiteName;
		this.suiteConfigName = this.suiteName.replace( 'base__', '' );
		process.env.SUITE = this.suiteName;
		process.env.SUITE_CONFIG_NAME = this.suiteConfigName;
		this.isBaseSuite = this.suiteName !== this.suiteConfigName;

		this.hostCWD = process.env.HOST_PWD;
		this.outputDir = `suites/${this.suiteName}/results`;

		this.config = config;

		this.testLogFilePath = `${this.outputDir}/${this.suiteName}.log`;
		this.screenshotPath = `${this.outputDir}/screenshots`;
		this.resultFilePath = `${this.outputDir}/result.json`;
		this.runHeaded = this.config.runHeaded || !!process.env.HEADED_TESTS;
		this.baseDockerComposeCmd = this.makeBaseDockerComposeCmd();
	}

	public async execute(): Promise<void> {
		try {
			console.log( `▶️  Starting "${this.suiteName}" Wikibase Suite test environment` );

			this.setupOutputDir();
			this.loadEnvFiles();
			this.beforeServices();

			this.stopServices();
			this.startServices();

			console.log( '▶️  Waiting for Docker services to start' );

			await this.waitForServices();

			console.log( `▶️  Running "${this.suiteName}" test suite` );

			if ( this.runHeaded ) {
				console.log(
					'\n💻 Open http://localhost:7900/?autoconnect=1&resize=scale&password=secret to observe headed tests.\n'
				);
			}
		} catch ( e ) {
			throw new SevereServiceError( e );
		}
	}

	protected beforeServices(): void {
		if ( this.config.beforeServices ) {
			this.config.beforeServices( this.isBaseSuite );
		}
	}

	public async before(): Promise<void> {
		if ( this.config.before ) {
			await this.config.before();
		}
	}

	public async onComplete(): Promise<void> {
		this.stopServices();
	}

	private setupOutputDir(): void {
		try {
			rmSync( this.outputDir, { recursive: true, force: true } );
			// eslint-disable-next-line security/detect-non-literal-fs-filename
			mkdirSync( this.outputDir, { recursive: true } );
		} catch ( e ) {
			testSetupLog.error( '❌ Error occurred in setting-up logs:', e );
		}
	}

	private loadEnvFiles(): void {
		this.config.envFiles
			.filter( ( envFilePath ) => envFilePath )
			.forEach( ( envFilePath ) => loadEnvVars( envFilePath ) );
	}

	private makeBaseDockerComposeCmd(): string {
		const dockerComposeCmdArray: string[] = [
			'docker compose',
			`--project-directory ${this.hostCWD}/suites`,
			'-p wikibase-suite'
		];
		this.config.composeFiles.forEach( ( composeFile ) =>
			dockerComposeCmdArray.push( `-f ${composeFile}` )
		);

		return dockerComposeCmdArray.join( ' ' );
	}

	public runDockerComposeCmd( dockerComposeOptionsCommandAndArgs: string ): void {
		const dockerComposeCmd = `${this.baseDockerComposeCmd} ${dockerComposeOptionsCommandAndArgs}`;

		testSetupLog.debug( 'Running: ', dockerComposeCmd );

		const result = spawnSync( dockerComposeCmd, { stdio: 'pipe', shell: true, encoding: 'utf-8' } );

		testSetupLog.debug( result.stdout );
		testSetupLog.debug( result.stderr );
	}

	public startServices(): void {
		testSetupLog.info( '▶️  Starting Wikibase Suite services' );
		this.runDockerComposeCmd( 'up -d' );
	}

	public stopServices( removeVolumes: boolean = true ): void {
		testSetupLog.info( '▶️  Stopping Wikibase Suite services' );
		this.runDockerComposeCmd( `down ${removeVolumes && '--volumes'} --remove-orphans --timeout 1` );
	}

	public async waitForServices(): Promise<void[]> {
		return Promise.all( this.config.waitForURLs().map(
			async ( waitForURL: string ): Promise<void> => {
				await checkIfUp( waitForURL );
				testSetupLog.info( `ℹ️  Successfully loaded ${waitForURL}` );
			}
		) );
	}

	// EXPERIMENTAL - For use in restarting services between tests
	public async resetServices( removeVolumes: boolean = false ): Promise<void> {
		console.log( '▶️  Resetting Docker services' );
		this.loadEnvFiles();
		this.beforeServices();
		this.stopServices( removeVolumes );
		this.startServices();
		await this.waitForServices();
		await this.before();
	}
}