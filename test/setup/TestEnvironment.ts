import { mkdirSync, rmSync } from 'fs';
import { spawnSync } from 'child_process';
import { SevereServiceError } from 'webdriverio';
import TestSettings from '../helpers/types/TestSettings.js';
import checkIfUp from './checkIfUp.js';
import logger, { Logger } from '@wdio/logger';
import envVars from './envVars.js';
import { makeSettings, makeSettingsAppendingToDefaults } from './makeTestSettings.js';

export default class TestEnvironment {
	private static instance: TestEnvironment;
	public settings: TestSettings;
	public vars: Record<string,string>;
	public testLog: Logger
	public baseDockerComposeCmd: string;

	public static createAppendingToDefaults(
		providedSettings: Partial<TestSettings>
	): TestEnvironment {
		const settings = makeSettingsAppendingToDefaults( providedSettings );
		return new this( settings );
	}

	public static createWithDefaults(
		providedSettings: Partial<TestSettings>
	): TestEnvironment {
		const settings = makeSettings( providedSettings );
		return new this( settings );
	}

	public constructor( settings?: TestSettings ) {
		if ( TestEnvironment.instance ) {
			return TestEnvironment.instance;
		}
		if ( !settings ) {
			throw new Error(
				'Settings are required to create a new Test Environment instance'
			);
		}

		this.settings = settings;
		this.vars = envVars;
		this.testLog = logger( 'test-testEnv' );
		this.testLog.setDefaultLevel( 'debug' );
		this.baseDockerComposeCmd = this.makeBaseDockerComposeCmd();
		TestEnvironment.instance = this;
	}

	public async up(): Promise<void> {
		try {
			process.once( 'SIGINT', async () => {
				await this.down();
				// eslint-disable-next-line no-process-exit
				process.exit( 1 );
			} );

			this.resetOutputDir();
			await this.settings.beforeServices( this );

			console.log( '▶️  Bringing up test testEnv' );

			this.stopServices();
			this.startServices();
			await this.waitForServices();

			if ( this.settings.runHeaded ) {
				console.log(
					'💻 Open http://localhost:7900/?autoconnect=1&resize=scale to observe headed tests.\n'
				);
			}
		} catch ( e ) {
			throw new SevereServiceError( e );
		}
	}

	public async down(): Promise<void> {
		this.stopServices();
	}

	public async waitForServices(): Promise<void[]> {
		return Promise.all( this.settings.waitForURLs( this ).map(
			async ( waitForURL: string ): Promise<void> => {
				await checkIfUp( waitForURL, this.settings.testTimeout );
				this.testLog.info( `ℹ️  Successfully loaded ${waitForURL}` );
			}
		) );
	}

	public runDockerComposeCmd( dockerComposeOptionsCommandAndArgs: string ): string {
		const dockerComposeCmd = `${this.baseDockerComposeCmd} ${dockerComposeOptionsCommandAndArgs}`;

		this.testLog.debug( 'Running: ', dockerComposeCmd );

		const result = spawnSync( dockerComposeCmd, {
			stdio: 'pipe',
			shell: true,
			encoding: 'utf-8',
			env: { ...envVars, OUTPUT_DIR: this.settings.outputDir }
		} );

		this.testLog.debug( result.stdout );

		if ( result.stderr ) {
			this.testLog.error( result.stderr );
		}

		return result.stdout || result.stderr;
	}

	protected resetOutputDir(): void {
		try {
			rmSync( this.settings.outputDir, { recursive: true, force: true } );
			// eslint-disable-next-line security/detect-non-literal-fs-filename
			mkdirSync( this.settings.outputDir, { recursive: true } );
		} catch ( e ) {
			this.testLog.error( '❌ Error occurred in setting-up logs:', e );
		}
	}

	protected makeBaseDockerComposeCmd(): string {
		const dockerComposeCmdArray: string[] = [
			'docker compose',
			`--project-directory ${this.settings.pwd}/suites`,
			'-p wikibase-suite-test-services'
		];

		this.settings.composeFiles.forEach( ( composeFile ) =>
			dockerComposeCmdArray.push( `-f ${composeFile}` )
		);

		return dockerComposeCmdArray.join( ' ' );
	}

	protected startServices(): void {
		this.testLog.info( '▶️  Starting Wikibase Suite services' );
		this.runDockerComposeCmd( 'up -d' );
	}

	protected stopServices( removeVolumes: boolean = true ): void {
		this.testLog.info( '▶️  Stopping Wikibase Suite services' );
		this.runDockerComposeCmd( `down ${removeVolumes && '--volumes'} --remove-orphans --timeout 1` );
	}
}
