import type { CommandRunner } from './process.js';
import { ProcessCommandRunner } from './process.js';

export interface ComposeProjectOptions {
	projectDirectory: string;
	composeFiles: string[];
	envFiles?: string[];
	projectName?: string;
	profiles?: string[];
	env?: NodeJS.ProcessEnv;
}

export interface ComposeDownOptions {
	removeOrphans?: boolean;
	timeoutSeconds?: number;
	volumes?: boolean;
}

/**
 * Process-backed Docker Compose project operations shared by long-lived product
 * environments and disposable test environments.
 */
export class ComposeProject {
	public constructor(
		private readonly options: ComposeProjectOptions,
		private readonly runner: CommandRunner = new ProcessCommandRunner()
	) {}

	public commandArguments( args: string[] ): string[] {
		const command = [
			'compose',
			'--project-directory',
			this.options.projectDirectory
		];
		for ( const envFile of this.options.envFiles ?? [] ) {
			command.push( '--env-file', envFile );
		}
		if ( this.options.projectName ) {
			command.push( '--project-name', this.options.projectName );
		}
		for ( const composeFile of this.options.composeFiles ) {
			command.push( '--file', composeFile );
		}
		for ( const profile of this.options.profiles ?? [] ) {
			command.push( '--profile', profile );
		}
		return [ ...command, ...args ];
	}

	public async run(
		args: string[],
		output: 'capture' | 'inherit' = 'inherit'
	): Promise<string> {
		return await this.runner.run( 'docker', this.commandArguments( args ), {
			cwd: this.options.projectDirectory,
			env: this.options.env,
			output
		} );
	}

	public async up( wait = true ): Promise<void> {
		await this.run( [ 'up', '--detach', ...( wait ? [ '--wait' ] : [] ) ] );
	}

	public async pull(): Promise<void> {
		await this.run( [ 'pull' ] );
	}

	public async down( options: ComposeDownOptions = {} ): Promise<void> {
		const args = [ 'down' ];
		if ( options.volumes ) {
			args.push( '--volumes' );
		}
		if ( options.removeOrphans ) {
			args.push( '--remove-orphans' );
		}
		if ( options.timeoutSeconds !== undefined ) {
			args.push( '--timeout', options.timeoutSeconds.toString() );
		}
		await this.run( args );
	}

	public async status(): Promise<void> {
		await this.run( [ 'ps' ] );
	}
}
