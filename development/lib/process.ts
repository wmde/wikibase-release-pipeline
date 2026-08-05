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
