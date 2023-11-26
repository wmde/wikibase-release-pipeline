import { mkdir, rm } from 'fs/promises';
import { spawnSync } from 'child_process';
import { createWriteStream } from 'fs';
import { Console } from 'console';
import { SevereServiceError } from 'webdriverio';
import checkIfUp from './checkIfUp.js';
import loadLocalDockerImage from './loadLocalDockerImage.js';
import loadEnvVars from './loadEnvVars.js';

export type TestSetupConfig = {
	envFiles?: string[];
	composeFiles?: string[];
	waitForURLs?: string[];
	// Currently only used for the "example" test suite, but is useful
	// for using any docker compose service setup not based upon
	// local builds.
	skipLocalDockerImageLoad?: boolean;
	// Can configure headed runs for the test environment directly,
	// or globally by setting the HEADED_TESTS env var
	runHeaded?: boolean;
	before?(): Promise<void>;
};

export class TestSetup {
	protected config: TestSetupConfig;
	protected hostCWD: string;
	protected resultsDir: string;
	protected testLog: Console;
	protected testLogFilePath: string;
	public baseDockerComposeCmd: string;
	public isBaseSuite: boolean;
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

		await this.setupLogs();
		this.loadEnvFiles();

		if ( !this.config.skipLocalDockerImageLoad ) {
			this.setupAndLoadDockerImages();
		}

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

	private async setupLogs(): Promise<void> {
		try {
			await rm( this.resultsDir, { recursive: true, force: true } );
			// eslint-disable-next-line security/detect-non-literal-fs-filename
			await mkdir( this.resultsDir, { recursive: true } );
			// eslint-disable-next-line security/detect-non-literal-fs-filename
			const outputLog = createWriteStream( this.testLogFilePath );
			// eslint-disable-next-line security/detect-non-literal-fs-filename
			const errorsLog = createWriteStream( this.testLogFilePath );

			this.testLog = new Console( outputLog, errorsLog );
		} catch ( e ) {
			console.log( '❌ Error occurred in setting-up logs:', e );
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
		this.config.envFiles
			.filter( ( envFilePath ) => envFilePath )
			.forEach( ( envFile ) =>
				dockerComposeCmdArray.push( `--env-file ${envFile}` )
			);
		this.config.composeFiles.forEach( ( composeFile ) =>
			dockerComposeCmdArray.push( `-f ${composeFile}` )
		);

		return dockerComposeCmdArray.join( ' ' );
	}

	private setupAndLoadDockerImages(): void {
		process.env.DATABASE_IMAGE_NAME = process.env.DATABASE_IMAGE_NAME ||
			process.env.DEFAULT_DATABASE_IMAGE_NAME;
		process.env.WIKIBASE_TEST_IMAGE_NAME = this.isBaseSuite ?
			process.env.WIKIBASE_IMAGE_NAME :
			process.env.WIKIBASE_BUNDLE_IMAGE_NAME;

		const defaultImages = [
			process.env.WIKIBASE_TEST_IMAGE_NAME,
			process.env.WDQS_IMAGE_NAME,
			process.env.WDQS_FRONTEND_IMAGE_NAME,
			process.env.WDQS_PROXY_IMAGE_NAME
		];

		const bundleImages = [
			process.env.ELASTICSEARCH_IMAGE_NAME,
			process.env.QUICKSTATEMENTS_IMAGE_NAME
		];

		// Does it do anything to be adding the ":latest" tag to these?
		process.env.WIKIBASE_TEST_IMAGE_NAME = `${process.env.WIKIBASE_TEST_IMAGE_NAME}:latest`;
		process.env.QUERYSERVICE_IMAGE_NAME = `${process.env.QUERYSERVICE_IMAGE_NAME}:latest`;
		process.env.QUERYSERVICE_UI_IMAGE_NAME = `${process.env.QUERYSERVICE_IMAGE_NAME}:latest`;
		process.env.WDQS_PROXY_IMAGE_NAME = `${process.env.WDQS_PROXY_IMAGE_NAME}:latest`;
		process.env.QUICKSTATEMENTS_IMAGE_NAME = `${process.env.QUICKSTATEMENTS_IMAGE_NAME}:latest`;
		process.env.ELASTICSEARCH_IMAGE_NAME = `${process.env.ELASTICSEARCH_IMAGE_NAME}:latest`;

		defaultImages.forEach( ( defaultImage ) => loadLocalDockerImage( defaultImage ) );

		if ( !this.isBaseSuite ) {
			bundleImages.forEach( ( bundleImage ) => loadLocalDockerImage( bundleImage ) );
		}
	}

	public startServices( dockerComposeOptions = '' ): void {
		try {
			console.log( '▶️  Starting Wikibase Suite services' );

			const startServicesCmd = `${this.baseDockerComposeCmd} ${dockerComposeOptions} up -d`;
			const result = spawnSync( startServicesCmd, { stdio: 'pipe', shell: true, encoding: 'utf-8' } );

			this.testLog.log( result.stdout );
			this.testLog.log( result.stderr );
		} catch ( e ) {
			throw new SevereServiceError( e );
		}
	}

	public async waitForServices(): Promise<void[]> {
		console.log( '▶️  Waiting for Wikibase Suite services' );
		return Promise.all( this.config.waitForURLs.map(
			async ( waitForURL: string ): Promise<void> => {
				return checkIfUp( waitForURL );
			}
		) );
	}

	public stopServices( removeVolumes: boolean = true ): void {
		console.log( '▶️  Stopping Wikibase Suite services' );

		const stopServiceCmd =
			`${this.baseDockerComposeCmd} down ${removeVolumes ? '--volumes' : ''} --remove-orphans --timeout 1`;

		const result = spawnSync( stopServiceCmd, { stdio: 'pipe', shell: true, encoding: 'utf-8' } );

		this.testLog.log( result.stdout );
		this.testLog.log( result.stderr );
	}
}
