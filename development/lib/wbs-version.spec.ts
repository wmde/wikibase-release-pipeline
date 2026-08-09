import { describe, it } from 'mocha';
import assert from 'node:assert/strict';
import {
	readWbsVersionManifest,
	withWbsToolsImage,
	withWbsVersion
} from './wbs-version.js';

const manifest = `# release metadata
WBS_VERSION=8.0.0
WBS_TOOLS_IMAGE=wikibase/wbs-tools:1.0.0
`;

describe('WBS version manifest', () => {
	it('reads the WBS version and exact tools image', () => {
		assert.deepEqual(readWbsVersionManifest(manifest), {
			version: '8.0.0',
			toolsImage: 'wikibase/wbs-tools:1.0.0'
		});
	});

	it('updates one value without rewriting the manifest', () => {
		assert.equal(
			withWbsVersion(manifest, '8.0.1'),
			manifest.replace('WBS_VERSION=8.0.0', 'WBS_VERSION=8.0.1')
		);
		assert.equal(
			withWbsToolsImage(manifest, 'example.test/wbs-tools:1.1.0'),
			manifest.replace(
				'WBS_TOOLS_IMAGE=wikibase/wbs-tools:1.0.0',
				'WBS_TOOLS_IMAGE=example.test/wbs-tools:1.1.0'
			)
		);
	});
});
