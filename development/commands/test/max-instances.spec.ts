import { describe, it } from 'mocha';
import assert from 'node:assert/strict';
import { applyMaxInstancesCap } from '../../tests/_setup/max-instances.js';

describe( 'integration test worker cap', () => {
	it( 'retains the suite default without a local cap', () => {
		assert.equal( applyMaxInstancesCap( 3, undefined ), 3 );
	} );

	it( 'can lower but not raise the suite worker count', () => {
		assert.equal( applyMaxInstancesCap( 3, '1' ), 1 );
		assert.equal( applyMaxInstancesCap( 1, '3' ), 1 );
	} );

	it( 'rejects invalid caps', () => {
		for ( const cap of [ '0', '-1', '1.5', 'many' ] ) {
			assert.throws(
				() => applyMaxInstancesCap( 3, cap ),
				/WBS_TEST_MAX_INSTANCES must be a positive integer/u
			);
		}
	} );
} );
