import { describe, it } from 'mocha';
import assert from 'node:assert/strict';
import type {
	CommandRunner,
	CommandRunOptions
} from './docker-compose.js';
import { ComposeProject } from './docker-compose.js';

class RecordingRunner implements CommandRunner {
	public calls: {
		command: string;
		args: string[];
		options: CommandRunOptions;
	}[] = [];

	public async run(
		command: string,
		args: string[],
		options: CommandRunOptions
	): Promise<string> {
		this.calls.push( { command, args, options } );
		return 'output';
	}
}

describe( 'Docker Compose project', () => {
	it( 'builds commands from structured project configuration', () => {
		const project = new ComposeProject( {
			projectDirectory: '/repo',
			envFiles: [ '/repo/.env' ],
			projectName: 'suite',
			composeFiles: [ '/repo/docker-compose.yml', '/repo/local.yml' ],
			profiles: [ 'browser' ]
		} );

		assert.deepEqual( project.commandArguments( [ 'config', '--services' ] ), [
			'compose',
			'--project-directory',
			'/repo',
			'--env-file',
			'/repo/.env',
			'--project-name',
			'suite',
			'--file',
			'/repo/docker-compose.yml',
			'--file',
			'/repo/local.yml',
			'--profile',
			'browser',
			'config',
			'--services'
		] );
	} );

	it( 'provides consistent lifecycle operations', async () => {
		const runner = new RecordingRunner();
		const project = new ComposeProject(
			{ projectDirectory: '/repo', composeFiles: [ '/repo/compose.yml' ] },
			runner
		);

		await project.up();
		await project.status();
		await project.down( {
			volumes: true,
			removeOrphans: true,
			timeoutSeconds: 1
		} );

		assert.deepEqual(
			runner.calls.map( ( call ) => call.args ),
			[
				[
					'compose', '--project-directory', '/repo', '--file',
					'/repo/compose.yml', 'up', '--detach', '--wait'
				],
				[
					'compose', '--project-directory', '/repo', '--file',
					'/repo/compose.yml', 'ps'
				],
				[
					'compose', '--project-directory', '/repo', '--file',
					'/repo/compose.yml', 'down', '--volumes', '--remove-orphans',
					'--timeout', '1'
				]
			]
		);
	} );
} );
