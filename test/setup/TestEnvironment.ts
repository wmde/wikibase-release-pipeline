import { mkdirSync, rmSync } from 'fs';
import { spawnSync } from 'child_process';
import { SevereServiceError } from 'webdriverio';
import TestSettings from './TestSettings.js';
import checkIfUp from './checkIfUp.js';
import testLog from './testLog.js';
import { makeSettings, makeSettingsAppendingToDefaults } from './makeTestSettings.js';

export class TestEnvironment {
	public settings: TestSettings;
	public baseDockerComposeCmd: string;

	static createAppendingToDefaults ( providedSettings: Partial<TestSettings> ) {
		const settings = makeSettingsAppendingToDefaults( providedSettings );
		return new this( settings );
	}

	static createWithDefaults ( providedSettings: Partial<TestSettings> ) {
		const settings = makeSettings( providedSettings );
		return new this( settings )
	}

	public constructor( settings: TestSettings ) {
		this.settings = settings;
		this.baseDockerComposeCmd = this.makeBaseDockerComposeCmd();
	}

	public async up(): Promise<void> {
		try {
			process.on( 'SIGINT', () => {
				this.down();
				// eslint-disable-next-line no-process-exit
				process.exit( 1 );
			} );

			this.resetOutputDir();
			this.settings.beforeServices( this.settings );

			console.log( '▶️  Bringing up test environment' );

			this.stopServices();
			this.startServices();
			await this.waitForServices();

			if ( this.settings.runHeaded ) {
				console.log(
					'💻 Open http://localhost:7900/?autoconnect=1&resize=scale&password=secret to observe headed tests.\n'
				);
			}
		} catch ( e ) {
			throw new SevereServiceError( e );
		}
	}

	public down(): void {
		this.stopServices();
	}

	public async waitForServices(): Promise<void[]> {
		return Promise.all( this.settings.waitForURLs( this.settings ).map(
			async ( waitForURL: string ): Promise<void> => {
				await checkIfUp( waitForURL );
				testLog.info( `ℹ️  Successfully loaded ${waitForURL}` );
			}
		) );
	}

	public runDockerComposeCmd( dockerComposeOptionsCommandAndArgs: string ): void {
		const dockerComposeCmd = `${this.baseDockerComposeCmd} ${dockerComposeOptionsCommandAndArgs}`;

		testLog.debug( 'Running: ', dockerComposeCmd );

		this.settings.envVars.OUTPUT_DIR = this.settings.outputDir;
		const result = spawnSync( dockerComposeCmd, { stdio: 'pipe', shell: true, encoding: 'utf-8', env: this.settings.envVars } );

		testLog.debug( result.stdout );
		testLog.debug( result.stderr );
	}

	protected resetOutputDir(): void {
		try {
			rmSync( this.settings.outputDir, { recursive: true, force: true } );
			// eslint-disable-next-line security/detect-non-literal-fs-filename
			mkdirSync( this.settings.outputDir, { recursive: true } );
		} catch ( e ) {
			testLog.error( '❌ Error occurred in setting-up logs:', e );
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
		testLog.info( '▶️  Starting Wikibase Suite services' );
		this.runDockerComposeCmd( 'up -d' );
	}

	protected stopServices( removeVolumes: boolean = true ): void {
		testLog.info( '▶️  Stopping Wikibase Suite services' );
		this.runDockerComposeCmd( `down ${removeVolumes && '--volumes'} --remove-orphans --timeout 1` );
	}
}
