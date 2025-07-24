/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable es-x/no-optional-chaining */
import { exec, execFile } from 'node:child_process';
import util from 'node:util';

export const execAsync = util.promisify( exec );

interface ExecOptions {
	cwd?: string;
	env?: NodeJS.ProcessEnv;
}

export const execAsyncStream = (
	command: string,
	onData?: ( data: string ) => void,
	options: ExecOptions = {}
): Promise<{ stdout: string; stderr: string }> => {
	return new Promise( ( resolve, reject ) => {
		let stdoutComplete = '';
		let stderrComplete = '';

		// eslint-disable-next-line security/detect-child-process
		const childProcess = exec( command, options, ( error ) => {
			if ( error ) {
				reject( error );
				return;
			}
			resolve( { stdout: stdoutComplete, stderr: stderrComplete } );
		} );

		childProcess.stdout?.on( 'data', ( data: Buffer | string ) => {
			const stringData = data.toString();
			stdoutComplete += stringData;
			if ( onData ) {
				onData( stringData );
			}
		} );

		childProcess.stderr?.on( 'data', ( data: Buffer | string ) => {
			const stringData = data.toString();
			stderrComplete += stringData;
			if ( onData ) {
				onData( stringData );
			}
		} );

		childProcess.on( 'error', ( error ) => {
			console.log( error );
			reject( error );
		} );
	} );
};

export const execFileAsync = async (
	command: string,
	args: string[],
	options: { input?: string } = {}
): Promise<{ stdout: string; stderr: string }> => {
	const child = execFile( command, args );

	if ( options.input && child.stdin ) {
		child.stdin.write( options.input );
		child.stdin.end();
	}

	return new Promise( ( resolve, reject ) => {
		let stdout = '';
		let stderr = '';

		child.stdout?.on( 'data', ( data ) => {
			stdout += data.toString();
		} );

		child.stderr?.on( 'data', ( data ) => {
			stderr += data.toString();
		} );

		child.on( 'close', ( code ) => {
			if ( code === 0 ) {
				resolve( { stdout, stderr } );
			} else {
				reject(
					new Error( `Command failed with code ${ code }. Stderr: ${ stderr }` )
				);
			}
		} );

		child.on( 'error', reject );
	} );
};

export const sleep = ( ms: number ) => {
	// eslint-disable-next-line no-promise-executor-return
	return new Promise( ( resolve ) => setTimeout( resolve, ms ) );
};
