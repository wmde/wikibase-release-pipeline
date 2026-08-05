import { describe, it } from 'mocha';
import assert from 'node:assert/strict';
import { runTasks } from './tasks.js';

describe( 'task execution', () => {
	it( 'preserves a parallel task failure when another task finishes later', async () => {
		const previousExitCode = process.exitCode;
		process.exitCode = undefined;
		try {
			await assert.rejects(
				runTasks(
					[
						{ command: '/bin/sh', args: [ '-c', 'exit 7' ] },
						{ command: '/bin/sh', args: [ '-c', 'sleep 0.1; exit 0' ] }
					],
					{ cwd: process.cwd(), parallel: 2 }
				),
				/One or more tasks failed/u
			);
			assert.equal( process.exitCode, 7 );
		} finally {
			process.exitCode = previousExitCode;
		}
	} );
} );
