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
		assert.match( up.stdout, /--local/u );
		assert.match( up.stdout, /--build/u );
		assert.match( up.stdout, /then start with --local/u );
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
