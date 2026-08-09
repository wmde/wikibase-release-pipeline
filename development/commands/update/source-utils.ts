import { createHash } from 'node:crypto';
import {
	bakeObject,
	readBakeValue,
	replaceBakeValue,
	resolveBakeVariables,
	type BakeVariable
} from '../../lib/bake.js';
import { strong } from './presentation.js';
import type {
	SourceChange,
	SourcePin,
	SourceUpdateInteraction,
	SourceUpdatePlan
} from './source-types.js';

function githubHeaders(): Record<string, string> {
	const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
	return {
		Accept: 'application/vnd.github+json',
		...(token ? { Authorization: `Bearer ${token}` } : {}),
		'X-GitHub-Api-Version': '2022-11-28'
	};
}

export async function request(
	url: string,
	headers: Record<string, string> = {},
	method = 'GET'
): Promise<Response> {
	const response = await fetch(url, {
		headers,
		method,
		signal: AbortSignal.timeout(30000)
	});
	if (!response.ok) {
		throw new Error(`${url} returned HTTP ${response.status}.`);
	}
	return response;
}

export async function githubJson<T>(path: string): Promise<T> {
	const response = await request(
		`https://api.github.com${path}`,
		githubHeaders()
	);
	return (await response.json()) as T;
}

export async function githubCommit(
	repository: string,
	branch: string
): Promise<string> {
	const response = await request(
		`https://api.github.com/repos/${repository}/commits/${branch}`,
		githubHeaders()
	);
	return ((await response.json()) as { sha: string }).sha;
}

export async function gerritCommit(
	repository: string,
	branch: string
): Promise<string> {
	const url = `https://gerrit.wikimedia.org/r/plugins/gitiles/${repository}/+/refs/heads/${branch}?format=JSON`;
	const response = await request(url);
	const body = (await response.text()).replace(/^\)\]\}'\n/u, '');
	return (JSON.parse(body) as { commit: string }).commit;
}

export async function codebergCommit(
	repository: string,
	branch: string
): Promise<string> {
	const response = await request(
		`https://codeberg.org/api/v1/repos/${repository}/branches/${branch}`
	);
	return ((await response.json()) as { commit: { id: string } }).commit.id;
}

function repositorySlug(url: string, host: string): string {
	const prefix = `https://${host}/`;
	if (!url.startsWith(prefix)) {
		throw new Error(`Expected a ${host} repository URL; received ${url}.`);
	}
	return url.slice(prefix.length).replace(/\.git$/u, '');
}

function sourceString(
	source: Record<string, BakeVariable>,
	key: string,
	variable: string
): string {
	const value = source[key];
	if (typeof value !== 'string' || value === '') {
		throw new Error(`Bake source ${variable} has no string ${key}.`);
	}
	return value;
}

export function manifestPins(contents: string): SourcePin[] {
	const variables = resolveBakeVariables(contents, process.cwd());
	return [...variables.keys()].flatMap((variable) => {
		const value = variables.get(variable);
		if (!value || typeof value !== 'object' || Array.isArray(value)) {
			return [];
		}
		const source = bakeObject(variables, variable);
		if (!['gerrit', 'github', 'codeberg'].includes(String(source.kind))) {
			return [];
		}
		const kind = sourceString(source, 'kind', variable);
		const repo = sourceString(source, 'repo', variable);
		const ref = sourceString(source, 'ref', variable).replace(
			/^refs\/heads\//u,
			''
		);
		const description = `${
			typeof source.name === 'string' ? source.name : variable
		} ${ref}`;
		let resolve: SourcePin['resolve'];
		let compareUrl: SourcePin['compareUrl'];
		let commitUrl: SourcePin['commitUrl'];
		if (kind === 'github') {
			const repository = repositorySlug(repo, 'github.com');
			resolve = async () => await githubCommit(repository, ref);
			compareUrl = (previous, next) =>
				githubCompareUrl(repository, previous, next);
			commitUrl = (commit) => githubCommitUrl(repository, commit);
		} else if (kind === 'codeberg') {
			const repository = repositorySlug(repo, 'codeberg.org');
			resolve = async () => await codebergCommit(repository, ref);
			compareUrl = (previous, next) =>
				`https://codeberg.org/${repository}/compare/${previous}...${next}`;
			commitUrl = (commit) => codebergCommitUrl(repository, commit);
		} else {
			const repository = repositorySlug(repo, 'gerrit.wikimedia.org').replace(
				/^r\//u,
				''
			);
			resolve = async () => await gerritCommit(repository, ref);
			compareUrl = (previous, next) =>
				gerritCompareUrl(repository, previous, next);
			commitUrl = (commit) => gerritCommitUrl(repository, commit);
		}
		const archive =
			typeof source.archive === 'string' ? source.archive : undefined;
		return [
			{
				variable: `${variable}.revision`,
				description,
				resolve,
				compareUrl,
				commitUrl,
				...(archive
					? {
							archiveShaVariable: `${variable}.archive_sha256`,
							archiveUrl: (revision: string) =>
								archive.replace('{revision}', revision)
						}
					: {})
			}
		];
	});
}

export async function archiveSha256(url: string): Promise<string> {
	const response = await request(url);
	return createHash('sha256')
		.update(Buffer.from(await response.arrayBuffer()))
		.digest('hex');
}

function findVariable(contents: string, variable: string): string | undefined {
	const [name, attribute] = variable.split('.', 2);
	try {
		return readBakeValue(contents, name, attribute);
	} catch (error) {
		if (
			error instanceof Error &&
			/(?:Could not find Bake variable|has no (?:default|string))/u.test(
				error.message
			)
		) {
			return undefined;
		}
		throw error;
	}
}

export function readVariable(contents: string, variable: string): string {
	const value = findVariable(contents, variable);
	if (value === undefined) {
		throw new Error(`Could not find ${variable} in the Bake manifest.`);
	}
	return value;
}

function readPreviousVariable(
	contents: string,
	variable: string
): string | undefined {
	return findVariable(contents, variable);
}

function pinLink(
	pin: SourcePin,
	previous: string | undefined,
	next: string
): SourceChange['link'] {
	if (!previous) {
		return pin.commitUrl
			? { label: 'Commit', url: pin.commitUrl(next) }
			: undefined;
	}
	return pin.compareUrl
		? { label: 'Diff', url: pin.compareUrl(previous, next) }
		: undefined;
}

export function replaceVariable(
	contents: string,
	variable: string,
	value: string
): string {
	const [name, attribute] = variable.split('.', 2);
	return replaceBakeValue(contents, name, attribute, value);
}

export async function planPins(
	contents: string,
	pins: SourcePin[]
): Promise<SourceUpdatePlan> {
	let planned = contents;
	const changes: SourceChange[] = [];
	for (const pin of pins) {
		const previous = readVariable(planned, pin.variable);
		const next = await pin.resolve();
		if (previous === next) {
			continue;
		}
		planned = replaceVariable(planned, pin.variable, next);
		changes.push({
			variable: pin.variable,
			description: pin.description,
			previous,
			next,
			link: pinLink(pin, previous, next)
		});
	}
	return { contents: planned, changes };
}

export function describePinChanges(
	previousContents: string,
	nextContents: string,
	pins: SourcePin[]
): SourceChange[] {
	return pins.flatMap((pin) => {
		const previous = readPreviousVariable(previousContents, pin.variable);
		const next = readVariable(nextContents, pin.variable);
		if (previous === next) {
			return [];
		}
		return [
			{
				variable: pin.variable,
				description: pin.description,
				...(previous === undefined ? {} : { previous }),
				next,
				link: pinLink(pin, previous, next)
			}
		];
	});
}

export async function addArchiveChecksums(
	plan: SourceUpdatePlan,
	pins: SourcePin[]
): Promise<SourceUpdatePlan> {
	let contents = plan.contents;
	for (const pin of pins) {
		if (!pin.archiveShaVariable || !pin.archiveUrl) {
			continue;
		}
		const change = plan.changes.find(
			({ variable }) => variable === pin.variable
		);
		if (!change) {
			continue;
		}
		contents = replaceVariable(
			contents,
			pin.archiveShaVariable,
			await archiveSha256(pin.archiveUrl(change.next))
		);
	}
	return { ...plan, contents };
}

function shortReference(reference: string): string {
	return reference.length > 12 ? reference.slice(0, 12) : reference;
}

export function changeLines(changes: SourceChange[]): string[] {
	return changes.flatMap((change) => {
		const summary = change.previous
			? `${strong(change.description)}: ${strong(shortReference(change.previous))} → ${strong(shortReference(change.next))}`
			: `${strong(change.description)}: add ${strong(shortReference(change.next))}`;
		return [
			summary,
			...(change.link ? [`  ${change.link.label}: ${change.link.url}`] : [])
		];
	});
}

export async function confirmPinPlan(
	imageLabel: string,
	originalContents: string,
	plan: SourceUpdatePlan,
	interaction: SourceUpdateInteraction
): Promise<SourceUpdatePlan> {
	if (plan.changes.length === 0) {
		return plan;
	}
	interaction.note('Source candidate', changeLines(plan.changes));
	if (!(await interaction.confirm(`Update ${imageLabel}?`))) {
		return { contents: originalContents, changes: [] };
	}
	return plan;
}

export function githubCompareUrl(
	repository: string,
	previous: string,
	next: string
): string {
	return `https://github.com/${repository}/compare/${previous}...${next}`;
}

export function githubCommitUrl(repository: string, commit: string): string {
	return `https://github.com/${repository}/commit/${commit}`;
}

export function gerritCompareUrl(
	repository: string,
	previous: string,
	next: string
): string {
	return `https://gerrit.wikimedia.org/r/plugins/gitiles/${repository}/+log/${previous}..${next}`;
}

export function gerritCommitUrl(repository: string, commit: string): string {
	return `https://gerrit.wikimedia.org/r/plugins/gitiles/${repository}/+/${commit}`;
}

export function codebergCommitUrl(repository: string, commit: string): string {
	return `https://codeberg.org/${repository}/commit/${commit}`;
}
