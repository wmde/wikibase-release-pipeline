import { mkdirSync, rmSync } from 'fs';
import { spawnSync } from 'child_process';
import { SevereServiceError } from 'webdriverio';
import { TestSettings } from './TestConfig.js';
import checkIfUp from './checkIfUp.js';
import loadEnvVars from './loadEnvVars.js';
import loadLocalDockerImage from './loadLocalDockerImage.js';
import testLog from './testLog.js';

export type TestEnvironmentSettings = {
	envFiles?: string[];
	composeFiles?: string[];
	waitForURLs?(): string[];
	beforeServices?( isBaseSuite?: boolean ): void;
};

export const defaultTestEnvironmentSettings: TestEnvironmentSettings = {
	envFiles: [
		'../variables.env',
		'./setup/default.env',
		'../local.env'
	],
	composeFiles: [
		'suites/docker-compose.yml'
	],
	beforeServices: ( isBaseSuite?: boolean ): void => {
		process.env.WIKIBASE_TEST_IMAGE_NAME = isBaseSuite ?
			process.env.WIKIBASE_IMAGE_NAME : process.env.WIKIBASE_BUNDLE_IMAGE_NAME;

		const dockerImageUrls = [
			process.env.WIKIBASE_TEST_IMAGE_NAME,
			process.env.WDQS_IMAGE_NAME,
			process.env.WDQS_FRONTEND_IMAGE_NAME,
			process.env.WDQS_PROXY_IMAGE_NAME
		];
		const dockerExtraImageUrls = [
			process.env.ELASTICSEARCH_IMAGE_NAME,
			process.env.QUICKSTATEMENTS_IMAGE_NAME
		];

		dockerImageUrls.forEach( ( defaultImage ) => loadLocalDockerImage( defaultImage ) );

		if ( !isBaseSuite ) {
			dockerExtraImageUrls.forEach( ( bundleImage ) => loadLocalDockerImage( bundleImage ) );
		}
	},
	waitForURLs: () => ( [
		`${process.env.MW_SERVER}/wiki/Main_Page`,
		`http://${process.env.WDQS_SERVER}/bigdata/namespace/wdq/sparql`,
		`http://${process.env.WDQS_FRONTEND_SERVER}`
	] ),
};

export class TestEnvironment {
	protected settings: TestEnvironmentSettings;
	public testSettings: TestSettings;	
	public baseDockerComposeCmd: string;

	static createAppendingToDefaults (
		providedSettings: TestEnvironmentSettings,
		testSettings: TestSettings
	): TestEnvironment {
		const settings = {
			...defaultTestEnvironmentSettings,
			...providedSettings,
			envFiles: [
				...defaultTestEnvironmentSettings.envFiles,
				...( providedSettings.envFiles || [] )
			],
			composeFiles: [
				...defaultTestEnvironmentSettings.composeFiles,
				...( providedSettings.composeFiles || [] )
			],
			waitForURLs: () => ( [
				...defaultTestEnvironmentSettings.waitForURLs(),
				...( providedSettings.waitForURLs ? providedSettings.waitForURLs : () => ( [] ) )()
			] ),
			beforeServices: (): void => {
				defaultTestEnvironmentSettings.beforeServices( testSettings.isBaseSuite );
				if ( providedSettings.beforeServices ) {
					providedSettings.beforeServices( testSettings.isBaseSuite );
				}
			}
		};

		return new this( settings, testSettings );
	}

	public constructor(
		settings: TestEnvironmentSettings = defaultTestEnvironmentSettings,
		testSettings: TestSettings 
	) {
		this.settings = settings;
		this.testSettings = testSettings;
		this.baseDockerComposeCmd = this.makeBaseDockerComposeCmd();
	}

	public async up(): Promise<void> {
		try {
			process.on( 'SIGINT', () => {
				this.stopServices();
				// eslint-disable-next-line no-process-exit
				process.exit( 1 );
			} );

			this.resetOutputDirectory();
			this.loadEnvFiles();
			this.beforeServices();

			console.log( '▶️  Waiting for test services to become available' );

			this.stopServices();
			this.startServices();
			await this.waitForServices();

			if ( this.testSettings.runHeaded ) {
				console.log(
					'💻 Open http://localhost:7900/?autoconnect=1&resize=scale&password=secret to observe headed tests.\n'
				);
			}
		} catch ( e ) {
			throw new SevereServiceError( e );
		}
	}

	public async down(): Promise<void> {
		this.stopServices();
	}

	private resetOutputDirectory(): void {
		try {
			rmSync( this.testSettings.outputDir, { recursive: true, force: true } );
			// eslint-disable-next-line security/detect-non-literal-fs-filename
			mkdirSync( this.testSettings.outputDir, { recursive: true } );
		} catch ( e ) {
			testLog.error( '❌ Error occurred in setting-up logs:', e );
		}
	}

	protected beforeServices(): void {
		if ( this.settings.beforeServices ) {
			this.settings.beforeServices( this.testSettings.isBaseSuite );
		}
	}

	private loadEnvFiles(): void {
		this.settings.envFiles
			.filter( ( envFilePath ) => envFilePath )
			.forEach( ( envFilePath ) => loadEnvVars( envFilePath ) );
	}

	private makeBaseDockerComposeCmd(): string {
		const dockerComposeCmdArray: string[] = [
			'docker compose',
			`--project-directory ${this.testSettings.pwd}/suites`,
			'-p wikibase-suite'
		];
		this.settings.composeFiles.forEach( ( composeFile ) =>
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
		return Promise.all( this.settings.waitForURLs().map(
			async ( waitForURL: string ): Promise<void> => {
				await checkIfUp( waitForURL );
				testLog.info( `ℹ️  Successfully loaded ${waitForURL}` );
			}
		) );
	}
}
