import { describe, it } from 'mocha';
import assert from 'node:assert/strict';
import type { RepositoryContext } from '../context.js';
import type {
	CommandRunner,
	CommandRunOptions
} from '../lib/process.js';
import {
	runInstallerDevWeb,
	type InstallerDevWebDependencies
} from './web.js';

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
		return '';
	}
}

describe( 'installer-dev web environment', () => {
	it( 'builds local images and launches the real installer flow with live reload', async () => {
		const runner = new RecordingRunner();
		let builds = 0;
		const context: RepositoryContext = {
			developmentRoot: '/container/repo/development',
			hostRepositoryRoot: '/host/repo',
			imagesRoot: '/container/repo/development/images',
			repositoryRoot: '/container/repo',
			testRoot: '/container/repo/development/tests'
		};
		const dependencies: InstallerDevWebDependencies = {
			buildLocalImages: async () => {
				builds++;
			},
			commandRunner: runner
		};

		await runInstallerDevWeb( context, dependencies );

		assert.equal( builds, 1 );
		assert.equal( runner.calls.length, 1 );
		assert.deepEqual( runner.calls[ 0 ].args, [
			'/host/repo/scripts/run-installer.sh'
		] );
		assert.equal(
			runner.calls[ 0 ].options.env?.WBS_DIR,
			'/host/repo'
		);
		assert.equal(
			runner.calls[ 0 ].options.env?.ENV_FILE_PATH,
			'/host/repo/.env'
		);
		assert.equal( runner.calls[ 0 ].options.env?.INSTALLER_DEV, 'true' );
		assert.equal( runner.calls[ 0 ].options.env?.LOCALHOST, 'true' );
		assert.equal( runner.calls[ 0 ].options.env?.SKIP_LAUNCH, 'false' );
		assert.equal(
			runner.calls[ 0 ].options.env?.WBS_LAUNCH_FOREGROUND,
			'true'
		);
		assert.equal( runner.calls[ 0 ].options.env?.WBS_LOCAL_IMAGES, 'true' );
	} );
} );
