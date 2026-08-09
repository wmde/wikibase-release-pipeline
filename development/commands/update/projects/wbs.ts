import { relative } from 'node:path';
import type { RepositoryContext } from '../../../lib/context.js';
import type { FileUpdate } from '../../../lib/file-updates.js';
import type { GitRepository } from '../../../lib/git.js';
import type { ReleaseProject } from '../../../lib/projects.js';
import type { SourceChange } from '../../../lib/source-changes.js';
import {
	planVersionUpdate,
	type VersionPlan
} from '../../../lib/versioning.js';
import { defaultVersionPolicy } from '../versions.js';
import type { WbsToolsAdoption } from './wbs-tools.js';

export interface WbsUpdateSource {
	plan?: FileUpdate;
	changes: SourceChange[];
	path?: string;
}

export interface WbsUpdateOptions {
	source?: WbsUpdateSource;
	toolsAdoption?: WbsToolsAdoption;
	targetVersion?: string;
}

export function planWbsUpdate(
	context: RepositoryContext,
	git: GitRepository,
	wbs: ReleaseProject,
	options: WbsUpdateOptions = {}
): VersionPlan | undefined {
	if (wbs.name !== 'wbs') {
		throw new Error(`Expected the WBS release project; received ${wbs.name}.`);
	}
	const source = options.source ?? { changes: [] };
	const adoption = options.toolsAdoption;
	const proposedUpdates = [
		...(source.plan ? [source.plan] : []),
		...(adoption ? adoption.updates : [])
	];
	const sourceChanges = [
		...source.changes,
		...(adoption ? [adoption.change] : [])
	];
	const sourcePaths = [
		...(source.path ? [source.path] : []),
		...(adoption
			? adoption.updates.map((update) =>
					relative(context.repositoryRoot, update.path)
				)
			: [])
	];
	return planVersionUpdate(context, git, wbs, defaultVersionPolicy, {
		proposedUpdates,
		sourceChanges,
		sourcePaths,
		targetVersion: options.targetVersion
	});
}
