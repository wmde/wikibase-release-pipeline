import { spawn } from 'node:child_process';

export interface CommandRunOptions {
	cwd: string;
	env?: NodeJS.ProcessEnv;
	output?: 'capture' | 'inherit';
}

export interface CommandRunner {
	run(
		command: string,
		args: string[],
		options: CommandRunOptions
	): Promise<string>;
}

export class ProcessCommandRunner implements CommandRunner {
	public async run(
		command: string,
		args: string[],
		options: CommandRunOptions
	): Promise<string> {
		const capture = options.output === 'capture';
		return await new Promise( ( resolve, reject ) => {
			const child = spawn( command, args, {
				cwd: options.cwd,
				env: options.env ?? process.env,
				stdio: capture ? [ 'inherit', 'pipe', 'pipe' ] : 'inherit'
			} );
			let stdout = '';
			let stderr = '';
			if ( capture && child.stdout && child.stderr ) {
				child.stdout.setEncoding( 'utf8' );
				child.stderr.setEncoding( 'utf8' );
				child.stdout.on( 'data', ( chunk: string ) => {
					stdout += chunk;
				} );
				child.stderr.on( 'data', ( chunk: string ) => {
					stderr += chunk;
				} );
			}
			child.once( 'error', reject );
			child.once( 'exit', ( code, signal ) => {
				if ( signal ) {
					reject( new Error( `${ command } terminated by signal ${ signal }.` ) );
					return;
				}
				if ( code !== 0 ) {
					const detail = stderr.trim();
					reject(
						new Error(
							`${ command } exited with status ${ code ?? 1 }${ detail ? `: ${ detail }` : '.' }`
						)
					);
					return;
				}
				resolve( stdout );
			} );
		} );
	}
}

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
