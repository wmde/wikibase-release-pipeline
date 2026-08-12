import { relative } from 'node:path';
import type { RepositoryContext } from '../../../lib/context.js';
import type { GitRepository } from '../../../lib/git.js';
import type { ReleaseProject } from '../../../lib/projects.js';
import {
	planVersionUpdate,
	type VersionPlan
} from '../../../lib/versioning.js';
import type { WbsToolsAdoption } from './wbs-tools.js';

export interface WbsUpdateOptions {
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
	const adoption = options.toolsAdoption;
	const proposedUpdates = adoption ? adoption.updates : [];
	const sourceChanges = adoption ? [adoption.change] : [];
	const sourcePaths = adoption
		? adoption.updates.map((update) =>
				relative(context.repositoryRoot, update.path)
			)
		: [];
	return planVersionUpdate(context, git, wbs, {
		proposedUpdates,
		sourceChanges,
		sourcePaths,
		targetVersion: options.targetVersion
	});
}
