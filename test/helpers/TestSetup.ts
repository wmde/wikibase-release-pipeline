import { mkdir, rm } from 'fs/promises';
import { spawnSync } from 'child_process';
import { createWriteStream } from 'fs';
import { Console } from 'console';
import dotenv from 'dotenv';
import checkIfUp from './checkIfUp.js';
import loadLocalDockerImage from './loadLocalDockerImage.js';

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
};

export class TestSetup {
	protected config: TestSetupConfig;
	protected isBaseSuite: boolean;
	protected hostCWD: string;
	protected baseDockerComposeCmd: string;
	protected resultsDir: string;
	protected testLog: Console;
	public suiteName: string;
	public suiteConfigName: string;
	public testLogFilePath: string;
	public screenshotPath: string;
	public resultFilePath: string;
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
		this.loadEnvVars();

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

	private loadEnvVars(): void {
		// Load current local build variables
		this.config.envFiles
			.filter( ( envFilePath ) => envFilePath )
			.forEach( ( envFilePath ) => {
				dotenv.config( { path: envFilePath, override: true } );
			}
			);
	}

	private makeBaseDockerComposeCmd(): string {
		const dockerComposeCmdArray: string[] = [
			'docker compose',
			`--project-directory ${this.hostCWD}/suites`,
			'-p wikibase-suite'
		];
		this.config.envFiles.forEach( ( envFile ) =>
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

	private startServices(): void {
		console.log( '▶️  Starting Wikibase Suite services' );

		const startServicesCmd = `${this.baseDockerComposeCmd} up -d`;
		const result = spawnSync( startServicesCmd, { stdio: 'pipe', shell: true, encoding: 'utf-8' } );

		this.testLog.log( result.stdout );
		this.testLog.log( result.stderr );
	}

	private async waitForServices(): Promise<void[]> {
		console.log( '▶️  Waiting for Wikibase Suite services' );
		return Promise.all( this.config.waitForURLs.map(
			async ( waitForURL: string ): Promise<void> => {
				return checkIfUp( waitForURL );
			}
		) );
	}

	private stopServices(): void {
		console.log( '▶️  Stopping Wikibase Suite services' );

		const stopServiceCmd =
			`${this.baseDockerComposeCmd} down --volumes --remove-orphans --timeout 1`;

		const result = spawnSync( stopServiceCmd, { stdio: 'pipe', shell: true, encoding: 'utf-8' } );

		this.testLog.log( result.stdout );
		this.testLog.log( result.stderr );
	}
}

export const defaultTestSetupConfig: TestSetupConfig = {
	envFiles: [
		'../variables.env',
		'default.env',
		!process.env.CI && '../local.env'
	],
	composeFiles: [
		'suites/docker-compose.yml'
	],
	waitForURLs: [
		`${process.env.MW_SERVER}/wiki/Main_Page`,
		`http://${process.env.WDQS_SERVER}/bigdata/namespace/wdq/sparql`,
		`http://${process.env.WDQS_FRONTEND_SERVER}`
	],
	skipLocalDockerImageLoad: false,
	runHeaded: false
};

export class DefaultTestSetup extends TestSetup {
	public constructor(
		suiteName: string,
		config: TestSetupConfig = {}
	) {
		const testConfig = {
			...defaultTestSetupConfig,
			...config,
			envFiles: [
				...defaultTestSetupConfig.envFiles,
				...( config.envFiles || [] )
			],
			composeFiles: [
				...defaultTestSetupConfig.composeFiles,
				...( config.composeFiles || [] )
			],
			waitForURLs: [
				...defaultTestSetupConfig.waitForURLs,
				...( config.waitForURLs || [] )
			]
		};

		super( suiteName, testConfig );
	}
}
