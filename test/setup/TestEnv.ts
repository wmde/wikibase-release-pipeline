import { mkdirSync, rmSync } from 'fs';
import { spawnSync } from 'child_process';
import { SevereServiceError } from 'webdriverio';
import TestSettings from '../types/TestSettings.js';
import checkIfUp from './checkIfUp.js';
import logger, { Logger } from '@wdio/logger';
import { makeTestSettings } from './makeTestSettings.js';

declare global {
	// eslint-disable-next-line no-var, no-use-before-define
	var testEnv: TestEnv | undefined;
}

export default class TestEnv {
	public settings: TestSettings;
	public testLog: Logger;
	public baseDockerComposeCmd: string;

	public static createWithDefaults(
		providedSettings: Partial<TestSettings>
	): TestEnv {
		const settings = makeTestSettings( providedSettings );
		return new this( settings );
	}

	public constructor( settings?: TestSettings ) {
		if ( !settings ) {
			throw new Error(
				'Settings are required to create a Test Environment'
			);
		}

		this.settings = settings;
		this.testLog = logger( 'test-env' );
		this.testLog.setDefaultLevel( 'debug' );
		this.baseDockerComposeCmd = this.makeBaseDockerComposeCmd();
	}

	public get vars(): Record<string, string> {
		return this.settings.vars;
	}

	public async up(): Promise<void> {
		try {
			process.once( 'SIGINT', async () => {
				await this.down();
				// eslint-disable-next-line no-process-exit
				process.exit( 1 );
			} );

			this.resetOutputDir();
			await this.settings.beforeServices();

			console.log( '▶️  Bringing up the test environment' );

			await this.stopServices();
			await this.startServices();
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
		await this.stopServices();
	}

	public async waitForServices(): Promise<void[]> {
		return Promise.all( this.settings.waitForUrls().map(
			async ( waitForURL: string ): Promise<void> => {
				await checkIfUp( waitForURL, this.settings.testTimeout );
				this.testLog.info( `ℹ️  Successfully loaded ${waitForURL}` );
			}
		) );
	}

	public async runDockerComposeCmd(
		dockerComposeOptionsCommandAndArgs: string
	): Promise<string> {
		const dockerComposeCmd = `${this.baseDockerComposeCmd} ${dockerComposeOptionsCommandAndArgs}`;

		this.testLog.debug( 'Running: ', dockerComposeCmd );

		const result = spawnSync( dockerComposeCmd, {
			stdio: 'pipe',
			shell: true,
			encoding: 'utf-8',
			env: { ...this.vars, OUTPUT_DIR: this.settings.outputDir, PATH: process.env.PATH }
		} );

		// Docker Compose puts all status logging stderr so we instead use
		// the exit code (status) to catch any actual critical failures, ref:
		// https://github.com/docker/compose/issues/7346
		if ( result.status !== 0 ) {
			this.testLog.debug( result.stderr );
			throw new SevereServiceError( result.stderr );
		}

		return result.stdout;
	}

	protected resetOutputDir(): void {
		try {
			rmSync( this.settings.outputDir, { recursive: true, force: true } );
			// eslint-disable-next-line security/detect-non-literal-fs-filename
			mkdirSync( this.settings.outputDir, { recursive: true } );
		} catch ( e ) {
			this.testLog.error( '❌ Error occurred in setting-up outuput directory:', e );
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

	protected async startServices(): Promise<void> {
		this.testLog.info( '▶️  Starting Wikibase Suite services' );
		await this.runDockerComposeCmd( 'up -d' );
	}

	protected async stopServices( removeVolumes: boolean = true ): Promise<void> {
		this.testLog.info( '▶️  Stopping Wikibase Suite services' );
		await this.runDockerComposeCmd(
			`down ${removeVolumes && '--volumes'} --remove-orphans --timeout 1`
		);
	}
}
