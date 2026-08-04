import { describe, it } from 'mocha';
import assert from 'node:assert/strict';
import { resolveNames } from './selection.js';

const options = { command: 'example', noun: 'target' };

describe( 'command target selection', () => {
	it( 'uses every available name for an empty selection or all', () => {
		assert.deepEqual( resolveNames( [], [ 'one', 'two' ], options ), [ 'one', 'two' ] );
		assert.deepEqual( resolveNames( [ 'all' ], [ 'one', 'two' ], options ), [
			'one',
			'two'
		] );
	} );

	it( 'deduplicates explicit names and rejects ambiguous all', () => {
		assert.deepEqual( resolveNames( [ 'two', 'two' ], [ 'one', 'two' ], options ), [
			'two'
		] );
		assert.throws(
			() => resolveNames( [ 'all', 'one' ], [ 'one', 'two' ], options ),
			/cannot be combined/u
		);
	} );

	it( 'reports unknown names using the command vocabulary', () => {
		assert.throws(
			() => resolveNames( [ 'three' ], [ 'one', 'two' ], options ),
			/example: unknown target three.*Available targets: one, two/u
		);
	} );
} );
