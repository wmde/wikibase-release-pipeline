import { describe, it } from 'mocha';
import assert from 'node:assert/strict';
import { spawnSync, type SpawnSyncReturns } from 'node:child_process';
import { resolve } from 'node:path';

const CLI = resolve( 'tooling/cli.ts' );
const TSX = resolve( 'node_modules/.bin/tsx' );

function cli( ...args: string[] ): SpawnSyncReturns<string> {
	return spawnSync( TSX, [ CLI, ...args ], {
		cwd: process.cwd(),
		encoding: 'utf8'
	} );
}

describe( 'wbs-dev command contracts', () => {
	it( 'owns test options in the top-level command', () => {
		const result = cli( 'test', '--help' );
		assert.equal( result.status, 0, result.stderr );
		assert.match( result.stdout, /--headed/u );
		assert.match(
			result.stdout,
			/tooling \(fast development-tooling fixtures\)/u
		);
	} );

	it( 'exposes the product-oriented suite lifecycle', () => {
		const suite = cli( 'suite', '--help' );
		assert.equal( suite.status, 0, suite.stderr );
		for ( const command of [ 'up', 'down', 'status', 'reset' ] ) {
			assert.ok( suite.stdout.includes( command ) );
		}

		const up = cli( 'suite', 'up', '--help' );
		assert.equal( up.status, 0, up.stderr );
		assert.doesNotMatch( up.stdout, /^\s+--build(?:\s|$)/mu );
		assert.match( up.stdout, /--no-build/u );
		assert.match( up.stdout, /--published/u );
		assert.doesNotMatch( up.stdout, /--no-pull/u );
		assert.doesNotMatch( up.stdout, /--local/u );
		assert.match( up.stdout, /pulls upstream service images/u );
		assert.match( up.stdout, /builds\s+every WBS product image/u );
		assert.match( up.stdout, /prevents Compose from pulling the WBS product images/u );
		assert.match( up.stdout, /requires those local images to exist already/u );
		assert.match( up.stdout, /Docker Hub images to be tested/u );
		assert.match( up.stdout, /docker-compose\.local\.yml remains last/u );

		const reset = cli( 'suite', 'reset', '--help' );
		assert.equal( reset.status, 0, reset.stderr );
		assert.match( reset.stdout, /permanently removes Compose volumes/u );
		assert.match( reset.stdout, /remains stopped/u );
	} );

	it( 'exposes browser installer development', () => {
		const installerDev = cli( 'installer-dev', '--help' );
		assert.equal( installerDev.status, 0, installerDev.stderr );
		assert.match( installerDev.stdout, /web/u );
		assert.match( installerDev.stdout, /real local installation/u );
		assert.match( installerDev.stdout, /without changing configuration or services/u );

		const web = cli( 'installer-dev', 'web', '--help' );
		assert.equal( web.status, 0, web.stderr );
		assert.match( web.stdout, /browser installer with live reload/u );
		assert.match( web.stdout, /--mock/u );
		assert.match( web.stdout, /https:\/\/localhost:8888/u );
		assert.match( web.stdout, /writes the repository-root \.env/u );
		assert.match( web.stdout, /Builds only wbs-tools/u );
		assert.match( web.stdout, /does not write \.env/u );
		assert.match( web.stdout, /cannot be skipped/u );
	} );

	it( 'rejects integration options for the tooling-only target', () => {
		const result = cli( 'test', 'tooling', '--headed' );
		assert.notEqual( result.status, 0 );
		assert.match( result.stderr, /does not accept integration options/u );
	} );

	it( 'rejects redundant root lint selections before running tasks', () => {
		const result = cli( 'lint', 'root', 'development' );
		assert.notEqual( result.status, 0 );
		assert.match( result.stderr, /root.*includes every other lint target/u );
	} );
} );
