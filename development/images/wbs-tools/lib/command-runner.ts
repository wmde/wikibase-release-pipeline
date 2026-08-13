import { spawn } from 'node:child_process';
import {
	appendWbsLogEntry,
	appendWbsLogOutput,
	WBS_LOG_PATH
} from './wbs-log.js';

export type ProcessResult = {
	stdout: string;
	stderr: string;
	exitCode: number;
};

export async function captureProcess(
	command: string,
	args: string[],
	options: { logOutput?: boolean } = {}
): Promise<ProcessResult> {
	return await new Promise( ( resolve, reject ) => {
		const child = spawn( command, args, {
			env: process.env,
			stdio: [ 'ignore', 'pipe', 'pipe' ]
		} );
		let stdout = '';
		let stderr = '';
		child.stdout.setEncoding( 'utf8' );
		child.stderr.setEncoding( 'utf8' );
		child.stdout.on( 'data', ( chunk: string ) => {
			stdout += chunk;
			if ( options.logOutput ) {
				appendWbsLogOutput( chunk );
			}
		} );
		child.stderr.on( 'data', ( chunk: string ) => {
			stderr += chunk;
			if ( options.logOutput ) {
				appendWbsLogOutput( chunk );
			}
		} );
		child.once( 'error', reject );
		child.once( 'close', ( code, signal ) => {
			if ( signal ) {
				reject( new Error( `${ command } terminated by ${ signal }.` ) );
				return;
			}
			resolve( { stdout, stderr, exitCode: code ?? 1 } );
		} );
	} );
}

export async function runProcess(
	command: string,
	args: string[],
	options: { cwd?: string; env?: NodeJS.ProcessEnv; quiet?: boolean } = {}
): Promise<void> {
	const renderedCommand = [ command, ...args ].map( ( argument ) =>
		JSON.stringify( argument )
	).join( ' ' );
	appendWbsLogEntry( `BEGIN RUN: ${ renderedCommand }`, 'debug' );
	try {
		await new Promise<void>( ( resolve, reject ) => {
			const captureOutput = options.quiet === true ||
				( Boolean( WBS_LOG_PATH ) && process.stdout.isTTY !== true );
			const child = spawn( command, args, {
				cwd: options.cwd,
				env: options.env ?? process.env,
				stdio: captureOutput ? [ 'inherit', 'pipe', 'pipe' ] : 'inherit'
			} );
			let stderr = '';
			if ( options.quiet ) {
				child.stdout?.on( 'data', appendWbsLogOutput );
				child.stderr?.setEncoding( 'utf8' );
				child.stderr?.on( 'data', ( chunk: string ) => {
					stderr += chunk;
					appendWbsLogOutput( chunk );
				} );
			} else if ( captureOutput ) {
				child.stdout?.pipe( process.stdout, { end: false } );
				child.stderr?.pipe( process.stderr, { end: false } );
			}
			child.once( 'error', reject );
			child.once( 'close', ( code, signal ) => {
				if ( signal ) {
					reject( new Error( `${ command } terminated by ${ signal }.` ) );
				} else if ( code !== 0 ) {
					const detail = stderr.trim();
					reject( new Error(
						`${ command } exited with status ${ code ?? 'unknown' }${
							detail ? `: ${ detail }` : '.'
						}`
					) );
				} else {
					resolve();
				}
			} );
		} );
	} finally {
		appendWbsLogEntry( 'END RUN', 'debug' );
	}
}
