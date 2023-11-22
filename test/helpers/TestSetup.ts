// import { createWriteStream } from 'fs';
import { mkdir, rm } from 'fs/promises';
import { spawnSync } from 'child_process';
import dotenv from 'dotenv';
import checkIfUp from './checkIfUp.js';
import loadLocalDockerImage from './loadLocalDockerImage.js';

export type TestSetupConfig = {
	envFiles?: string[];
	composeFiles?: string[];
	checkIfUpURLs?: string[];
	skipLocalDockerImageLoad?: boolean;
};

export class TestSetup {
	protected config: TestSetupConfig;
	protected suiteName: string;
	protected suiteConfigName: string;
	protected resultsDir: string;
	protected testLogFilePath: string;
	protected screenshotPath: string;
	protected resultFilePath: string;
	protected isBaseSuite: boolean;
	protected hostCWD: string;
	protected baseDockerComposeCmd: string;
	// testLogStream: any;

	constructor(
		suiteName: string,
		config: TestSetupConfig = {}
	) {
		this.suiteName = suiteName;
		this.suiteConfigName = this.suiteName.replace( 'base__', '' );
		this.isBaseSuite = this.suiteName !== this.suiteConfigName;
		process.env.SUITE_CONFIG_NAME = this.suiteConfigName;

		this.config = config;

		this.resultsDir = `suites/${this.suiteName}/results`;
		this.testLogFilePath = `${this.resultsDir}/${this.suiteName}.log`;
		this.screenshotPath = `${this.resultsDir}/screenshots`;
		this.resultFilePath = `${this.resultsDir}/result.json`;
		this.hostCWD = process.env.HOST_PWD;

		this.baseDockerComposeCmd = this.makeBaseDockerComposeCmd();
	}

	async execute() {
		console.log( `\n▶️  Setting-up "${this.suiteName}" test suite` );
		this.setupLogs();
		this.loadEnvVars();
		!this.config.skipLocalDockerImageLoad && this.setupAndLoadDockerImages();
		this.stopServices();
		this.startServices();

		await this.waitForServices();
	}

	private async setupLogs(): Promise<void> {
		try {

			await rm( this.resultsDir, { recursive: true, force: true } );
			// eslint-disable-next-line security/detect-non-literal-fs-filename
			await mkdir( this.resultsDir, { recursive: true } );

			// TODO: Logging
			// console.log('!!!! this.testLogFilePath', this.testLogFilePath);
			// this.testLogStream = createWriteStream( this.testLogFilePath );
			// this.testLogStream.write('!!!! test');

		} catch ( e ) {
			console.log( '❌ Error occurred in setting-up logs:', e );
		}
	}

	private loadEnvVars() {
		// Load current local build variables
		this.config.envFiles.forEach( ( envFilePath ) => {
			dotenv.config( { path: envFilePath } );
		} );
	}

	private makeBaseDockerComposeCmd() {
		const dockerComposeCmdArray: string[] = [ 'docker compose' ];
		this.config.envFiles.forEach( ( envFile ) => dockerComposeCmdArray.push( `--env-file ${envFile}` ) );
		this.config.composeFiles.forEach( ( composeFile ) => dockerComposeCmdArray.push( `-f ${composeFile}` ) );
		// const composeOverrideFilePath = `suites/${this.suiteName}/docker-compose.override.yml`
		// try {
		//   await stat(composeOverrideFilePath)
		//   dockerComposeCmd += ` -f ${composeOverrideFilePath}`
		// } catch {}
		dockerComposeCmdArray.push( `--project-directory ${this.hostCWD}/suites` );
		dockerComposeCmdArray.push( '-p wikibase-suite' );

		return `${dockerComposeCmdArray.join( ' ' )}`;
	}

	setupAndLoadDockerImages() {
		process.env.DATABASE_IMAGE_NAME = process.env.DATABASE_IMAGE_NAME || process.env.DEFAULT_DATABASE_IMAGE_NAME;
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

	startServices() {
		const startServicesCmd = `${this.baseDockerComposeCmd} up -d`;

		// const startServicesResult =
		spawnSync( startServicesCmd, { stdio: 'inherit', shell: true } );
		// this.testLogStream.write(startServicesResult.stdout);
		// this.testLogStream.write(startServicesResult.stderr);
	}

	async waitForServices(): Promise<any> {
		return Promise.all( this.config.checkIfUpURLs.map( async ( checkIfUpURL ) => {
			return checkIfUp( checkIfUpURL );
		} ) );
	}

	stopServices() {
		const stopServiceCmd = `${this.baseDockerComposeCmd} down --volumes --remove-orphans --timeout 1`;

		// const stopServicesResult =
		spawnSync( stopServiceCmd, { stdio: 'inherit', shell: true } );
		// this.testLogStream.write(stopServicesResult.stdout);
		// this.testLogStream.write(stopServicesResult.stderr);
	}
}

export const defaultTestSetupConfig: TestSetupConfig = {
	envFiles: [
		'default.env',
		'variables.env',
		'local.env'
	],
	composeFiles: [
		'suites/docker-compose.yml'
	],
	checkIfUpURLs: [
		`${process.env.MW_SERVER}/wiki/Main_Page`,
		`http://${process.env.WDQS_SERVER}/bigdata/namespace/wdq/sparql`,
		`http://${process.env.WDQS_FRONTEND_SERVER}`
	]
};

export class DefaultTestSetup extends TestSetup {
	constructor(
		suiteName: string,
		config: TestSetupConfig = {}
	) {
		const testConfig = {
			envFiles: [ ...defaultTestSetupConfig.envFiles, ...( config.envFiles || [] ) ],
			composeFiles: [ ...defaultTestSetupConfig.composeFiles, ...( config.composeFiles || [] ) ],
			checkIfUpURLs: [ ...defaultTestSetupConfig.checkIfUpURLs, ...( config.checkIfUpURLs || [] ) ]
		};

		super( suiteName, testConfig );
	}
}
