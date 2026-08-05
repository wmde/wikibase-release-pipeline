import { spawn } from 'node:child_process';

export interface Task {
	label?: string;
	command: string;
	args: string[];
}

async function runTask( task: Task, cwd: string ): Promise<number> {
	if ( task.label ) {
		console.log( `\n=== ${ task.label } ===` );
	}
	return new Promise( ( resolve, reject ) => {
		const child = spawn( task.command, task.args, {
			cwd,
			env: process.env,
			stdio: 'inherit'
		} );
		child.once( 'error', reject );
		child.once( 'exit', ( code, signal ) => {
			if ( signal ) {
				console.error(
					`${ task.label ?? task.command } terminated by signal ${ signal }.`
				);
				resolve( 1 );
				return;
			}
			resolve( code ?? 1 );
		} );
	} );
}

export async function runTasks(
	tasks: Task[],
	options: { cwd: string; parallel?: number }
): Promise<void> {
	let nextTask = 0;
	let exitCode = 0;
	const parallel = options.parallel ?? 1;

	const worker = async (): Promise<void> => {
		while ( exitCode === 0 ) {
			const taskIndex = nextTask++;
			if ( taskIndex >= tasks.length ) {
				return;
			}
			const taskExitCode = await runTask( tasks[ taskIndex ], options.cwd );
			if ( taskExitCode !== 0 && exitCode === 0 ) {
				exitCode = taskExitCode;
			}
		}
	};

	await Promise.all(
		Array.from(
			{ length: Math.min( parallel, tasks.length ) },
			async () => await worker()
		)
	);

	if ( exitCode !== 0 ) {
		process.exitCode = exitCode;
		throw new Error( 'One or more tasks failed.' );
	}
}
