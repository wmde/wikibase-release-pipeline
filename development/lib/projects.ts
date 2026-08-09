import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import {
	BAKE_MANIFEST,
	readBakeScalar,
	replaceBakeValue
} from './bake.js';
import type { RepositoryContext } from './context.js';
import { resolveNames } from './selection.js';

export interface ReleaseProject {
	name: string;
	versionPath: string;
	changelogPath: string;
	pathspecs: string[];
	legacyTagNames: string[];
	isImage: boolean;
}

export function discoverImageNames(context: RepositoryContext): string[] {
	return readdirSync(context.imagesRoot, { withFileTypes: true })
		.filter(
			(entry) =>
				entry.isDirectory() &&
				!entry.name.startsWith('_') &&
				entry.name !== 'node_modules'
		)
		.map((entry) => entry.name)
		.sort();
}

export function discoverReleaseProjects(
	context: RepositoryContext
): ReleaseProject[] {
	return [
		{
			name: 'wbs',
			versionPath: join(context.repositoryRoot, 'package.json'),
			changelogPath: join(context.repositoryRoot, 'CHANGELOG.md'),
			pathspecs: [
				'.env.example',
				'README.md',
				'package.json',
				'CHANGELOG.md',
				'docker-compose.yml',
				'docker-compose.local.yml',
				'install',
				'wbs',
				'config',
				'docs',
				'scripts',
				'development/docker-compose.local-images.yml'
			],
			legacyTagNames: ['deploy'],
			isImage: false
		},
		...discoverImageNames(context).map(
			(name): ReleaseProject => ({
				name,
				versionPath: join(context.imagesRoot, name, BAKE_MANIFEST),
				changelogPath: join(context.imagesRoot, name, 'CHANGELOG.md'),
				pathspecs: [`development/images/${name}`],
				legacyTagNames: [],
				isImage: true
			})
		)
	];
}

export function projectVersion(
	project: ReleaseProject,
	contents?: string
): string {
	const source = contents ?? readFileSync(project.versionPath, 'utf8');
	if (project.isImage) {
		return readBakeScalar(source, 'IMAGE_VERSION');
	}
	return (JSON.parse(source) as { version: string }).version;
}

export function projectWithVersion(
	project: ReleaseProject,
	contents: string,
	version: string
): string {
	if (project.isImage) {
		return replaceBakeValue(contents, 'IMAGE_VERSION', undefined, version);
	}
	const packageJson = JSON.parse(contents) as Record<string, unknown>;
	packageJson.version = version;
	return `${JSON.stringify(packageJson, null, '\t')}\n`;
}

export function resolveProjectSelections(
	requested: string[],
	projects: ReleaseProject[],
	command: string,
	options: { requireExplicit?: boolean; imagesOnly?: boolean } = {}
): ReleaseProject[] {
	const availableProjects = projects.filter(
		(project) => !options.imagesOnly || project.isImage
	);
	const names = resolveNames(
		requested,
		availableProjects.map((project) => project.name),
		{ command, noun: 'project', requireExplicit: options.requireExplicit }
	);
	return names.map(
		(name) => availableProjects.find((project) => project.name === name)!
	);
}
