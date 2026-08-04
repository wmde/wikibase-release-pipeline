import { describe, it } from 'mocha';
import assert from 'node:assert/strict';
import type { RepositoryContext } from '../context.js';
import type {
	CommandRunner,
	CommandRunOptions
} from '../lib/process.js';
import { SuiteEnvironment } from './environment.js';

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

const context: RepositoryContext = {
	repositoryRoot: '/container/repo',
	developmentRoot: '/container/repo/development',
	hostRepositoryRoot: '/host/repo',
	imagesRoot: '/container/repo/development/images',
	testRoot: '/container/repo/development/tests'
};

function createEnvironment( existing: string[] = [ '/host/repo/.env' ] ): {
	environment: SuiteEnvironment;
	runner: RecordingRunner;
	removed: string[];
	builds: { count: number };
} {
	const runner = new RecordingRunner();
	const removed: string[] = [];
	const builds = { count: 0 };
	return {
		environment: new SuiteEnvironment( context, {
			buildImages: async () => {
				builds.count++;
			},
			commandRunner: runner,
			fileSystem: {
				exists: ( path ) => existing.includes( path ),
				remove: ( path ) => removed.push( path )
			}
		} ),
		runner,
		removed,
		builds
	};
}

describe( 'Suite environment', () => {
	it( 'starts released images from the normal root configuration by default', async () => {
		const { environment, runner, builds } = createEnvironment();

		await environment.up( {} );

		assert.equal( builds.count, 0 );
		assert.deepEqual( runner.calls[ 0 ].args, [
			'compose', '--project-directory', '/host/repo', '--env-file',
			'/host/repo/.env', '--file', '/host/repo/docker-compose.yml',
			'up', '--detach', '--wait'
		] );
	} );

	it( 'makes build imply the local image override', async () => {
		const { environment, runner, builds } = createEnvironment( [
			'/host/repo/.env',
			'/host/repo/docker-compose.local.yml'
		] );

		await environment.up( { build: true } );

		assert.equal( builds.count, 1 );
		assert.deepEqual(
			runner.calls[ 0 ].args.filter( ( argument ) =>
				argument.endsWith( '.yml' )
			),
			[
				'/host/repo/docker-compose.yml',
				'/host/repo/docker-compose.local.yml',
				'/host/repo/development/docker-compose.local-images.yml'
			]
		);
	} );

	it( 'resets volumes and generated configuration without restarting', async () => {
		const generated = [
			'/host/repo/config/LocalSettings.php',
			'/host/repo/config/wikibase-php.ini',
			'/host/repo/config/wdqs-frontend-config.json'
		];
		const { environment, runner, removed } = createEnvironment( [
			'/host/repo/.env',
			...generated
		] );

		await environment.reset();

		assert.deepEqual( removed, generated );
		assert.equal( runner.calls.length, 1 );
		assert.ok( runner.calls[ 0 ].args.includes( '--volumes' ) );
	} );
} );
