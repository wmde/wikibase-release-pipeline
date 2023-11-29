import { mkdirSync, rmSync } from 'fs';
import { spawnSync } from 'child_process';
import { SevereServiceError } from 'webdriverio';
import checkIfUp from './checkIfUp.js';
import loadEnvVars from './loadEnvVars.js';
import testLog from './testLog.js';

export type TestEnvironmentConfig = {
	envFiles?: string[];
	composeFiles?: string[];
	waitForURLs?(): string[];
	before?(): Promise<void>;
	beforeServices?( isBaseSuite: boolean ): void;
	// Can configure headed runs for the test environment directly,
	// or globally by setting the HEADED_TESTS env var
	runHeaded?: boolean;
};

export class TestEnvironment {
	public baseDockerComposeCmd: string;
	public isBaseSuite: boolean;
	public outputDir: string;
	public resultFilePath: string;
	public screenshotPath: string;
	public suiteName: string;
	public suiteConfigName: string;
	public runHeaded: boolean;
	protected config: TestEnvironmentConfig;
	protected hostCWD: string;

	public constructor(
		suiteName: string,
		config: TestEnvironmentConfig = {}
	) {
		this.suiteName = suiteName;
		this.suiteConfigName = this.suiteName.replace( 'base__', '' );
		process.env.SUITE = this.suiteName;
		process.env.SUITE_CONFIG_NAME = this.suiteConfigName;
		this.isBaseSuite = this.suiteName !== this.suiteConfigName;

		this.config = config;
		this.runHeaded = this.config.runHeaded || !!process.env.HEADED_TESTS;
		this.hostCWD = process.env.HOST_PWD || process.env.PWD;
		this.outputDir = `suites/${this.suiteName}/results`;
		this.screenshotPath = `${this.outputDir}/screenshots`;
		this.resultFilePath = `${this.outputDir}/result.json`;

		this.baseDockerComposeCmd = this.makeBaseDockerComposeCmd();
	}

	public async execute(): Promise<void> {
		try {
			process.on( 'SIGINT', () => {
				this.stopServices();
				// eslint-disable-next-line no-process-exit
				process.exit( 1 );
			} );

			this.setupOutputDir();
			this.loadEnvFiles();
			this.beforeServices();

			console.log( '▶️  Waiting for test services to become available' );

			this.stopServices();
			this.startServices();
			await this.waitForServices();

			if ( this.runHeaded ) {
				console.log(
					'💻 Open http://localhost:7900/?autoconnect=1&resize=scale&password=secret to observe headed tests.\n'
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
			testLog.error( '❌ Error occurred in setting-up logs:', e );
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

		testLog.debug( 'Running: ', dockerComposeCmd );

		const result = spawnSync( dockerComposeCmd, { stdio: 'pipe', shell: true, encoding: 'utf-8' } );

		testLog.debug( result.stdout );
		testLog.debug( result.stderr );
	}

	public startServices(): void {
		testLog.info( '▶️  Starting Wikibase Suite services' );
		this.runDockerComposeCmd( 'up -d' );
	}

	public stopServices( removeVolumes: boolean = true ): void {
		testLog.info( '▶️  Stopping Wikibase Suite services' );
		this.runDockerComposeCmd( `down ${removeVolumes && '--volumes'} --remove-orphans --timeout 1` );
	}

	public async waitForServices(): Promise<void[]> {
		return Promise.all( this.config.waitForURLs().map(
			async ( waitForURL: string ): Promise<void> => {
				await checkIfUp( waitForURL );
				testLog.info( `ℹ️  Successfully loaded ${waitForURL}` );
			}
		) );
	}
}
