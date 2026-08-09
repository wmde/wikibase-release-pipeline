import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { readBakeScalar } from '../../../lib/bake.js';
import type { FileUpdate } from '../../../lib/file-updates.js';
import type { ReleaseProject } from '../../../lib/projects.js';
import type { SourceChange } from '../../../lib/source-changes.js';
import {
	readWbsVersionManifest,
	withWbsToolsImage
} from '../../../lib/wbs-version.js';

export interface WbsToolsAdoption {
	change: SourceChange;
	updates: FileUpdate[];
}

function updateBootstrapImage(contents: string, image: string): string {
	const pattern = /^WBS_TOOLS_IMAGE="\$\{WBS_TOOLS_IMAGE:-[^}]+\}"$/mu;
	if (!pattern.test(contents)) {
		throw new Error('The install bootstrap has no WBS_TOOLS_IMAGE default.');
	}
	return contents.replace(
		pattern,
		`WBS_TOOLS_IMAGE="\${WBS_TOOLS_IMAGE:-${image}}"`
	);
}

export function planWbsToolsAdoption(
	wbs: ReleaseProject,
	wbsTools: ReleaseProject,
	toolsVersion: string
): WbsToolsAdoption | undefined {
	const wbsContents = readFileSync(wbs.versionPath, 'utf8');
	const currentImage = readWbsVersionManifest(wbsContents).toolsImage;
	const toolsContents = readFileSync(wbsTools.versionPath, 'utf8');
	const repository = readBakeScalar(toolsContents, 'IMAGE_REPOSITORY');
	const nextImage = `${repository}:${toolsVersion}`;
	if (currentImage === nextImage) {
		return undefined;
	}
	const repositoryRoot = dirname(dirname(wbs.versionPath));
	const installPath = join(repositoryRoot, 'install');
	return {
		change: {
			variable: 'WBS_TOOLS_IMAGE',
			description: 'WBS Tools image',
			previous: currentImage,
			next: nextImage
		},
		updates: [
			{
				path: wbs.versionPath,
				contents: withWbsToolsImage(wbsContents, nextImage)
			},
			{
				path: installPath,
				contents: updateBootstrapImage(
					readFileSync(installPath, 'utf8'),
					nextImage
				)
			}
		]
	};
}
