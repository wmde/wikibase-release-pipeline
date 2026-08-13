import semver from 'semver';
import { bakeObject, resolveBakeVariables } from '../../../lib/bake.js';
import { strong } from '../presentation.js';
import type {
	SourceChange,
	SourceUpdateInteraction,
	SourceUpdateProvider
} from '../source-types.js';
import {
	changeLines,
	describePinChanges,
	manifestPins,
	planPins,
	readVariable,
	replaceVariable,
	request
} from '../source-utils.js';

export function wikibasePins(contents: string) {
	return manifestPins(contents);
}

interface MediaWikiSettings {
	source: string;
	releaseNotes: string;
}

function mediaWikiSettings(contents: string): MediaWikiSettings {
	const mediaWiki = bakeObject(
		resolveBakeVariables(contents, process.cwd()),
		'MEDIAWIKI'
	);
	return {
		source: String(mediaWiki.source).replace(/\/?$/u, '/'),
		releaseNotes: String(mediaWiki.release_notes)
	};
}

function releaseNotesUrl(settings: MediaWikiSettings, version: string): string {
	return settings.releaseNotes.replace(
		'{line}',
		version.replace(/\.\d+$/u, '')
	);
}

async function mediaWikiVersionsInLine(
	line: string,
	source: string
): Promise<string[]> {
	const response = await request(`${source}${line}/`);
	const page = await response.text();
	return [
		...new Set(
			[...page.matchAll(/mediawiki-(\d+\.\d+\.\d+)\.tar\.gz/gmu)].map(
				(match) => match[1]
			)
		)
	].sort(semver.rcompare);
}

export async function discoverMediaWikiCandidates(
	currentVersion: string,
	source = 'https://releases.wikimedia.org/mediawiki/'
): Promise<{ maintenance?: string; newerLine?: string }> {
	const current = semver.parse(currentVersion);
	if (!current) {
		throw new Error(`Invalid MEDIAWIKI_VERSION "${currentVersion}".`);
	}
	const normalizedSource = source.replace(/\/?$/u, '/');
	const response = await request(normalizedSource);
	const page = await response.text();
	const lines = [
		...new Set(
			[...page.matchAll(/href="(\d+\.\d+)\//gmu)].map((match) => match[1])
		)
	]
		.filter((line) => {
			const parsed = semver.parse(`${line}.0`);
			return (
				parsed && semver.gte(parsed, `${current.major}.${current.minor}.0`)
			);
		})
		.sort((left, right) => semver.rcompare(`${left}.0`, `${right}.0`));
	const versionsByLine = await Promise.all(
		lines.map(async (line) => ({
			line,
			versions: await mediaWikiVersionsInLine(line, normalizedSource)
		}))
	);
	const currentLine = `${current.major}.${current.minor}`;
	const maintenance = versionsByLine.find(({ line }) => line === currentLine)
		?.versions[0];
	const newerLine = versionsByLine.find(
		({ line, versions }) => line !== currentLine && versions.length > 0
	)?.versions[0];
	return {
		maintenance:
			maintenance && semver.gt(maintenance, currentVersion)
				? maintenance
				: undefined,
		newerLine
	};
}

export async function selectMediaWikiUpdate(
	currentVersion: string,
	candidates: { maintenance?: string; newerLine?: string },
	interaction: Pick<SourceUpdateInteraction, 'confirm' | 'select'>
): Promise<string | undefined> {
	if (!candidates.maintenance && !candidates.newerLine) {
		return (await interaction.confirm('Refresh extensions?'))
			? currentVersion
			: undefined;
	}
	const selection = await interaction.select(
		`Update ${strong('MediaWiki')}? (current: ${strong(currentVersion)})`,
		[
			...(candidates.maintenance
				? [
						{
							value: candidates.maintenance,
							label: `Update to ${strong(candidates.maintenance)} and refresh compatible extensions`
						}
					]
				: []),
			...(candidates.newerLine
				? [
						{
							value: candidates.newerLine,
							label: `Move to ${strong(candidates.newerLine)} and refresh compatible extensions`,
							hint: 'requires major-version compatibility review'
						}
					]
				: []),
			{ value: 'skip', label: 'No' }
		]
	);
	if (selection === 'skip') {
		return (await interaction.confirm('Refresh extensions?'))
			? currentVersion
			: undefined;
	}
	return selection;
}

export const wikibaseSourceProvider: SourceUpdateProvider = {
	image: 'wikibase',
	describeChanges: (previousContents, nextContents) => {
		const settings = mediaWikiSettings(nextContents);
		const previousVersion = readVariable(previousContents, 'MEDIAWIKI.version');
		const nextVersion = readVariable(nextContents, 'MEDIAWIKI.version');
		const mediaWikiChange: SourceChange[] =
			previousVersion === nextVersion
				? []
				: [
						{
							variable: 'MEDIAWIKI.version',
							description: 'MediaWiki',
							previous: previousVersion,
							next: nextVersion,
							link: {
								label: 'Release notes',
								url: releaseNotesUrl(settings, nextVersion)
							}
						}
					];
		return [
			...mediaWikiChange,
			...describePinChanges(
				previousContents,
				nextContents,
				wikibasePins(nextContents)
			)
		];
	},
	plan: async (contents, interaction) => {
		const settings = mediaWikiSettings(contents);
		const currentVersion = readVariable(contents, 'MEDIAWIKI.version');
		const candidates = await discoverMediaWikiCandidates(
			currentVersion,
			settings.source
		);
		const selectedVersion = await selectMediaWikiUpdate(
			currentVersion,
			candidates,
			interaction
		);
		if (!selectedVersion) {
			return { contents, changes: [] };
		}
		let plannedContents = contents;
		const changes: SourceChange[] = [];
		if (selectedVersion !== currentVersion) {
			plannedContents = replaceVariable(
				plannedContents,
				'MEDIAWIKI.version',
				selectedVersion
			);
			changes.push({
				variable: 'MEDIAWIKI.version',
				description: 'MediaWiki',
				previous: currentVersion,
				next: selectedVersion,
				link: {
					label: 'Release notes',
					url: releaseNotesUrl(settings, selectedVersion)
				}
			});
		}
		const pins = await planPins(plannedContents, wikibasePins(plannedContents));
		changes.push(...pins.changes);
		if (changes.length === 0) {
			interaction.info(
				'The image and its configured extensions are already current.'
			);
			return { contents, changes: [] };
		}
		interaction.note('Source update', changeLines(changes));
		return { contents: pins.contents, changes };
	}
};
