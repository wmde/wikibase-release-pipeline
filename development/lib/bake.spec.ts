import { describe, it } from 'mocha';
import assert from 'node:assert/strict';
import { readBakeScalar, readBakeValue, replaceBakeValue } from './bake.js';

const manifest = `# ünicode keeps source offsets honest
variable "IMAGE_VERSION" { default = "8.0.0" } # retained

variable "SOURCE" {
  default = {
    revision     = "old"
    revision_url = "https://example.test/old" # retained too
  }
}
`;

describe('Bake manifest editing', () => {
	it('reads scalar and object string literals from HCL', () => {
		assert.equal(readBakeScalar(manifest, 'IMAGE_VERSION'), '8.0.0');
		assert.equal(readBakeValue(manifest, 'SOURCE', 'revision'), 'old');
	});

	it('replaces only the exact literal while preserving formatting and comments', () => {
		const expected = manifest.replace(
			'revision     = "old"',
			'revision     = "new\\nvalue"'
		);
		assert.equal(
			replaceBakeValue(manifest, 'SOURCE', 'revision', 'new\nvalue'),
			expected
		);
	});

	it('does not mistake similar variable or attribute names for the target', () => {
		const updated = replaceBakeValue(
			manifest,
			'SOURCE',
			'revision_url',
			'https://new.example/'
		);
		assert.equal(readBakeValue(updated, 'SOURCE', 'revision'), 'old');
		assert.equal(
			readBakeValue(updated, 'SOURCE', 'revision_url'),
			'https://new.example/'
		);
	});

	it('rejects malformed HCL and computed values', () => {
		assert.throws(
			() => readBakeScalar('variable "X" { default = "broken"', 'X'),
			/Could not parse/u
		);
		assert.throws(
			() => readBakeScalar('variable "X" { default = "${OTHER}" }', 'X'),
			/no string default attribute/u
		);
	});
});
