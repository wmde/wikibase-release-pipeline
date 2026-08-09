import { afterEach, describe, it } from 'mocha';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { bakeObject, resolveBakeVariables } from '../../lib/bake.js';
import type { SourceUpdateInteraction } from './source-types.js';
import {
	confirmPinPlan,
	describePinChanges,
	planPins,
	readVariable,
	replaceVariable
} from './source-utils.js';
import { discoverWdqsCandidates, wdqsSourceProvider } from './sources/wdqs.js';
import {
	discoverMediaWikiCandidates,
	wikibasePins
} from './sources/wikibase.js';

const WIKIBASE_IMAGE = resolve('images/wikibase');
const WDQS_MANIFEST = resolve('images/wdqs/docker-bake.hcl');
const originalFetch = globalThis.fetch;

const pinManifest = (value: string) =>
	`variable "PIN" {\n  default = "${value}"\n}\n`;

describe('Wikibase source update provider', () => {
	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	it('discovers every managed source from the authoritative manifest', () => {
		const contents = readFileSync(
			resolve(WIKIBASE_IMAGE, 'docker-bake.hcl'),
			'utf8'
		);
		const variables = resolveBakeVariables(contents, WIKIBASE_IMAGE);
		const managed = [...variables.keys()].filter((name) => {
			const value = variables.get(name);
			return (
				value !== null &&
				typeof value === 'object' &&
				!Array.isArray(value) &&
				['gerrit', 'github', 'codeberg'].includes(
					String(bakeObject(variables, name).kind)
				)
			);
		});
		const pins = wikibasePins(contents);
		assert.deepEqual(
			pins.map(({ variable }) => variable).sort(),
			managed.map((name) => `${name}.revision`).sort()
		);
		assert.equal(
			new Set(pins.map(({ variable }) => variable)).size,
			pins.length
		);
	});

	it('discovers maintenance and newer stable MediaWiki releases', async () => {
		const pages = new Map([
			[
				'https://releases.wikimedia.org/mediawiki/',
				'<a href="1.47/">1.47</a><a href="1.46/">1.46</a>'
			],
			[
				'https://releases.wikimedia.org/mediawiki/1.47/',
				'mediawiki-1.47.0.tar.gz mediawiki-1.47.0.tar.gz'
			],
			[
				'https://releases.wikimedia.org/mediawiki/1.46/',
				'mediawiki-1.46.2.tar.gz mediawiki-1.46.1.tar.gz'
			]
		]);
		globalThis.fetch = async (input) => {
			const url = String(input);
			const page = pages.get(url);
			assert.notEqual(page, undefined, `unexpected request ${url}`);
			return new Response(page, { status: 200 });
		};

		assert.deepEqual(await discoverMediaWikiCandidates('1.46.0'), {
			maintenance: '1.46.2',
			newerLine: '1.47.0'
		});
	});

	it('keeps manifest-managed Wikimedia extensions aligned with the Dockerfile', () => {
		const manifest = readFileSync(
			resolve(WIKIBASE_IMAGE, 'docker-bake.hcl'),
			'utf8'
		);
		const dockerfile = readFileSync(
			resolve(WIKIBASE_IMAGE, 'Dockerfile'),
			'utf8'
		);
		const match = /^ARG WMF_EXTENSIONS="([^"]+)"$/mu.exec(dockerfile);
		assert.ok(match, 'Dockerfile must declare WMF_EXTENSIONS');
		const variables = resolveBakeVariables(manifest, WIKIBASE_IMAGE);
		const extensionVariables = [...variables.keys()].filter((name) => {
			const value = variables.get(name);
			return (
				value !== null &&
				typeof value === 'object' &&
				!Array.isArray(value) &&
				bakeObject(variables, name).kind === 'gerrit'
			);
		});
		const extensions = extensionVariables.map((name) =>
			String(bakeObject(variables, name).name)
		);
		assert.deepEqual(new Set(match[1].split(',')), new Set(extensions));
		for (const name of extensionVariables) {
			assert.match(dockerfile, new RegExp(`^ARG ${name}_COMMIT$`, 'mu'));
		}
	});
});

describe('other source update providers', () => {
	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	it('discovers newer Query Service releases in version order', async () => {
		globalThis.fetch = async () =>
			new Response(
				JSON.stringify([
					{ name: 'query-service-parent-0.3.166' },
					{ name: 'unrelated-tag' },
					{ name: 'query-service-parent-0.3.165' },
					{ name: 'query-service-parent-0.3.164' }
				]),
				{ status: 200 }
			);

		assert.deepEqual(await discoverWdqsCandidates('0.3.164'), [
			'0.3.166',
			'0.3.165'
		]);
	});

	it('shows a Query Service comparison before confirmation', async () => {
		globalThis.fetch = async (input, init) => {
			const url = String(input);
			if (url.startsWith('https://api.github.com/')) {
				return new Response(
					JSON.stringify([
						{ name: 'query-service-parent-0.3.165' },
						{ name: 'query-service-parent-0.3.164' }
					]),
					{ status: 200 }
				);
			}
			if (init?.method === 'HEAD') {
				return new Response(null, { status: 200 });
			}
			if (url.endsWith('.md5')) {
				return new Response('0123456789abcdef0123456789abcdef', {
					status: 200
				});
			}
			throw new Error(`unexpected request ${url}`);
		};
		const notes: string[] = [];
		const interaction: SourceUpdateInteraction = {
			confirm: async () => false,
			select: async () => {
				throw new Error('selection was not expected');
			},
			note: (_title, lines) => notes.push(...lines),
			info: () => undefined
		};
		const contents = readFileSync(WDQS_MANIFEST, 'utf8');
		const result = await wdqsSourceProvider.plan(contents, interaction);

		assert.deepEqual(result, { contents, changes: [] });
		assert.ok(
			notes.some((line) =>
				line.includes(
					'compare/query-service-parent-0.3.164...query-service-parent-0.3.165'
				)
			)
		);
	});

	it('describes Query Service changes without rediscovering upstream state', () => {
		const previous = readFileSync(WDQS_MANIFEST, 'utf8');
		const next = replaceVariable(previous, 'WDQS.version', '0.3.165');
		assert.deepEqual(wdqsSourceProvider.describeChanges(previous, next), [
			{
				variable: 'WDQS.version',
				description: 'Query Service',
				previous: '0.3.164',
				next: '0.3.165',
				link: {
					label: 'Diff',
					url: 'https://github.com/wikimedia/wikidata-query-rdf/compare/query-service-parent-0.3.164...query-service-parent-0.3.165'
				}
			}
		]);
	});

	it('preserves the original file when a deterministic update is declined', async () => {
		const interaction: SourceUpdateInteraction = {
			confirm: async () => false,
			select: async () => {
				throw new Error('selection was not expected');
			},
			note: () => undefined,
			info: () => undefined
		};
		const original = pinManifest('old');
		const result = await confirmPinPlan(
			'Example',
			original,
			{
				contents: pinManifest('new'),
				changes: [
					{
						variable: 'PIN',
						description: 'Example source',
						previous: 'old',
						next: 'new'
					}
				]
			},
			interaction
		);
		assert.deepEqual(result, { contents: original, changes: [] });
	});

	it('populates an intentionally empty source declaration', async () => {
		const plan = await planPins(pinManifest(''), [
			{
				variable: 'PIN',
				description: 'Example source',
				resolve: async () => 'abc123',
				commitUrl: (commit) => `https://example.test/commit/${commit}`
			}
		]);
		assert.equal(readVariable(plan.contents, 'PIN'), 'abc123');
		assert.equal(plan.changes[0].next, 'abc123');
	});

	it('describes a source absent from the previous release as newly added', () => {
		assert.equal(
			describePinChanges('', pinManifest('abc123'), [
				{
					variable: 'PIN',
					description: 'Example source',
					resolve: async () => 'unused',
					commitUrl: (commit) => `https://example.test/commit/${commit}`
				}
			])[0].next,
			'abc123'
		);
	});

	it('still rejects a source missing from the current manifest', async () => {
		assert.equal(readVariable(pinManifest(''), 'PIN'), '');
		assert.equal(
			readVariable(replaceVariable(pinManifest(''), 'PIN', 'abc123'), 'PIN'),
			'abc123'
		);
		await assert.rejects(
			planPins('', [
				{
					variable: 'PIN',
					description: 'Example source',
					resolve: async () => 'abc123'
				}
			]),
			/Could not find PIN in the Bake manifest\./u
		);
	});
});
