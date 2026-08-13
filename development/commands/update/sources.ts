import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { BAKE_MANIFEST } from '../../lib/bake.js';
import type { RepositoryContext } from '../../lib/context.js';
import type { FileUpdate } from '../../lib/file-updates.js';
import { quickStatementsSourceProvider } from './projects/quickstatements.js';
import { wdqsFrontendSourceProvider } from './projects/wdqs-frontend.js';
import { wdqsSourceProvider } from './projects/wdqs.js';
import { wikibaseSourceProvider } from './projects/wikibase.js';
import type {
	SourceChange,
	SourceUpdateInteraction,
	SourceUpdateProvider
} from './source-types.js';

const providers = [
	wikibaseSourceProvider,
	wdqsSourceProvider,
	wdqsFrontendSourceProvider,
	quickStatementsSourceProvider
];

const providersByImage = new Map<string, SourceUpdateProvider>(
	providers.map((provider) => [provider.image, provider])
);

export function sourceUpdateProviderFor(
	image: string
): SourceUpdateProvider | undefined {
	return providersByImage.get(image);
}

export interface SourceFileUpdate extends FileUpdate {
	changes: SourceChange[];
}

export async function planSourceFileUpdate(
	context: RepositoryContext,
	provider: SourceUpdateProvider,
	interaction: SourceUpdateInteraction
): Promise<SourceFileUpdate> {
	const path = join(context.imagesRoot, provider.image, BAKE_MANIFEST);
	const original = readFileSync(path, 'utf8');
	const plan = await provider.plan(original, interaction);
	return {
		path,
		contents: plan.contents,
		changes: plan.changes
	};
}
