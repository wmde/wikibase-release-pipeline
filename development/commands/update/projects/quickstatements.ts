import type { SourceUpdateProvider } from '../source-types.js';
import {
	addArchiveChecksums,
	confirmPinPlan,
	describePinChanges,
	manifestPins,
	planPins
} from '../source-utils.js';

export const quickStatementsSourceProvider: SourceUpdateProvider = {
	image: 'quickstatements',
	describeChanges: (previousContents, nextContents) =>
		describePinChanges(
			previousContents,
			nextContents,
			manifestPins(nextContents)
		),
	plan: async (contents, interaction) => {
		const pins = manifestPins(contents);
		const confirmed = await confirmPinPlan(
			'QuickStatements',
			contents,
			await planPins(contents, pins),
			interaction
		);
		return confirmed.changes.length > 0
			? await addArchiveChecksums(confirmed, pins)
			: confirmed;
	}
};
