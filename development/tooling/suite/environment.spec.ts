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
	builds: { count: number; pullOccurredFirst: boolean };
} {
	const runner = new RecordingRunner();
	const removed: string[] = [];
	const builds = { count: 0, pullOccurredFirst: false };
	return {
		environment: new SuiteEnvironment( context, {
			buildImages: async () => {
				builds.pullOccurredFirst = runner.calls.some( ( call ) =>
					call.args[ call.args.length - 1 ] === 'pull'
				);
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
	it( 'pulls upstream images before building and starting local product images', async () => {
		const { environment, runner, builds } = createEnvironment( [
			'/host/repo/.env',
			'/host/repo/docker-compose.local.yml'
		] );

		await environment.up();

		assert.equal( builds.count, 1 );
		assert.equal( builds.pullOccurredFirst, true );
		assert.equal( runner.calls.length, 2 );
		assert.equal( runner.calls[ 0 ].args[ runner.calls[ 0 ].args.length - 1 ], 'pull' );
		const expectedComposeFiles = [
			'/host/repo/docker-compose.yml',
			'/host/repo/development/docker-compose.local-images.yml',
			'/host/repo/docker-compose.local.yml'
		];
		for ( const call of runner.calls ) {
			assert.deepEqual(
				call.args.filter( ( argument ) => argument.endsWith( '.yml' ) ),
				expectedComposeFiles
			);
		}
		assert.equal( runner.calls[ 1 ].args[ runner.calls[ 1 ].args.length - 3 ], 'up' );
	} );

	it( 'can pull and start published images with the root customization last', async () => {
		const { environment, runner, builds } = createEnvironment( [
			'/host/repo/.env',
			'/host/repo/docker-compose.local.yml'
		] );

		await environment.up( { published: true } );

		assert.equal( builds.count, 0 );
		assert.equal( runner.calls.length, 2 );
		for ( const call of runner.calls ) {
			assert.deepEqual(
				call.args.filter( ( argument ) => argument.endsWith( '.yml' ) ),
				[
					'/host/repo/docker-compose.yml',
					'/host/repo/docker-compose.local.yml'
				]
			);
		}
	} );

	it( 'can start existing local product images without rebuilding', async () => {
		const { environment, runner, builds } = createEnvironment();

		await environment.up( { build: false } );

		assert.equal( builds.count, 0 );
		assert.equal( runner.calls.length, 2 );
		assert.equal( runner.calls[ 0 ].args[ runner.calls[ 0 ].args.length - 1 ], 'pull' );
		assert.ok( runner.calls[ 1 ].args.includes(
			'/host/repo/development/docker-compose.local-images.yml'
		) );
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
