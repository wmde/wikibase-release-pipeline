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
	public resultsDir: string;
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
		this.resultsDir = `suites/${this.suiteName}/results`;

		this.config = config;

		this.testLogFilePath = `${this.resultsDir}/${this.suiteName}.log`;
		this.screenshotPath = `${this.resultsDir}/screenshots`;
		this.resultFilePath = `${this.resultsDir}/result.json`;
		this.runHeaded = this.config.runHeaded || !!process.env.HEADED_TESTS;
		this.baseDockerComposeCmd = this.makeBaseDockerComposeCmd();
	}

	public async execute(): Promise<void> {
		console.log( `▶️  Starting "${this.suiteName}" test environment` );

		this.setupResultsDir();
		this.loadEnvFiles();
		this.setupAndLoadLocalDockerImages();
		this.stopServices();
		this.startServices();

		await this.waitForServices();

		console.log( `▶️  Running specs for "${this.suiteName}" test suite` );

		if ( this.runHeaded ) {
			console.log(
				'💻 Open http://localhost:7900/?autoconnect=1&resize=scale&password=secret to observe headed tests.'
			);
		}
	}

	public async before(): Promise<void> {
		if ( this.config.before ) {
			await this.config.before();
		}
	}

	private setupResultsDir(): void {
		try {
			rmSync( this.resultsDir, { recursive: true, force: true } );
			// eslint-disable-next-line security/detect-non-literal-fs-filename
			mkdirSync( this.resultsDir, { recursive: true } );
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

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	protected setupAndLoadLocalDockerImages(): void {}

	public runDockerComposeCmd( dockerComposeOptionsCommandAndArgs: string ): void {
		try {
			const dockerComposeCmd = `${this.baseDockerComposeCmd} ${dockerComposeOptionsCommandAndArgs}`;

			testSetupLog.info( 'Running: ', dockerComposeCmd );

			const result = spawnSync( dockerComposeCmd, { stdio: 'pipe', shell: true, encoding: 'utf-8' } );

			testSetupLog.debug( result.stdout );
			testSetupLog.debug( result.stderr );
		} catch ( e ) {
			throw new SevereServiceError( e );
		}
	}

	public startServices(): void {
		console.log( '▶️  Starting Wikibase Suite services' );
		this.runDockerComposeCmd( 'up -d' );
	}

	public stopServices(): void {
		console.log( '▶️  Stopping Wikibase Suite services' );
		this.runDockerComposeCmd( 'down --volumes --remove-orphans --timeout 1' );
	}

	public async waitForServices(): Promise<void[]> {
		console.log( '▶️  Waiting for Wikibase Suite services' );
		return Promise.all( this.config.waitForURLs().map(
			async ( waitForURL: string ): Promise<void> => {
				return checkIfUp( waitForURL );
			}
		) );
	}
}
