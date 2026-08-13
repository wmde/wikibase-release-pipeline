import { describe, it } from 'mocha';
import assert from 'node:assert/strict';
import { projectLabel, projectOptionLabel } from './presentation.js';

describe('update project presentation', () => {
	it('pairs friendly menu labels with canonical command-line keys', () => {
		assert.equal(projectLabel('wbs'), 'Wikibase Suite');
		assert.equal(
			projectOptionLabel('wdqs-frontend'),
			'Query Service frontend (wdqs-frontend)'
		);
	});

	it('falls back to an unmapped project key', () => {
		assert.equal(projectLabel('future-project'), 'future-project');
		assert.equal(projectOptionLabel('future-project'), 'future-project');
	});
});
