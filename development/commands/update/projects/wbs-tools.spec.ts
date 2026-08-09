import { describe, it } from 'mocha';
import assert from 'node:assert/strict';
import {
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import type { ReleaseProject } from '../../../lib/projects.js';
import { readWbsVersionManifest } from '../../../lib/wbs-version.js';
import { planWbsToolsAdoption } from './wbs-tools.js';

function write(path: string, contents: string): void {
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, contents);
}

describe('WBS Tools adoption', () => {
	it('proposes the exact repository and version for the WBS release', () => {
		const root = mkdtempSync(join(tmpdir(), 'wbs-tools-adoption-'));
		try {
			const wbsPath = join(root, '.wbs/version');
			const toolsPath = join(
				root,
				'development/images/wbs-tools/docker-bake.hcl'
			);
			write(
				wbsPath,
				'WBS_VERSION=8.0.0\nWBS_TOOLS_IMAGE=wikibase/wbs-tools:1.0.0\n'
			);
			write(
				toolsPath,
				'variable "IMAGE_REPOSITORY" { default = "registry.example/wbs-tools" }\nvariable "IMAGE_VERSION" { default = "1.1.0" }\n'
			);
			write(
				join(root, 'install'),
				'#!/usr/bin/env bash\nWBS_TOOLS_IMAGE="${WBS_TOOLS_IMAGE:-wikibase/wbs-tools:1.0.0}"\n'
			);
			const project = (name: string, versionPath: string): ReleaseProject => ({
				name,
				versionPath,
				changelogPath: join(root, 'CHANGELOG.md'),
				pathspecs: [],
				legacyTagNames: [],
				isImage: name !== 'wbs'
			});
			const adoption = planWbsToolsAdoption(
				project('wbs', wbsPath),
				project('wbs-tools', toolsPath),
				'1.2.0'
			)!;
			assert.equal(adoption.change.previous, 'wikibase/wbs-tools:1.0.0');
			assert.equal(adoption.change.next, 'registry.example/wbs-tools:1.2.0');
			const versionUpdate = adoption.updates.find(
				(update) => update.path === wbsPath
			)!;
			assert.equal(
				readWbsVersionManifest(versionUpdate.contents).toolsImage,
				'registry.example/wbs-tools:1.2.0'
			);
			assert.ok(
				adoption.updates
					.find((update) => update.path === join(root, 'install'))!
					.contents.includes(
						'WBS_TOOLS_IMAGE="${WBS_TOOLS_IMAGE:-registry.example/wbs-tools:1.2.0}"'
					)
			);
			assert.equal(readFileSync(wbsPath, 'utf8').includes('1.2.0'), false);
		} finally {
			rmSync(root, { recursive: true, force: true });
		}
	});
});
