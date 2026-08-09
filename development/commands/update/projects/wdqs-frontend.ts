import type { SourceUpdateProvider } from '../source-types.js';
import {
	confirmPinPlan,
	describePinChanges,
	manifestPins,
	planPins
} from '../source-utils.js';

export const wdqsFrontendSourceProvider: SourceUpdateProvider = {
	image: 'wdqs-frontend',
	describeChanges: (previousContents, nextContents) =>
		describePinChanges(
			previousContents,
			nextContents,
			manifestPins(nextContents)
		),
	plan: async (contents, interaction) =>
		await confirmPinPlan(
			'Query Service frontend',
			contents,
			await planPins(contents, manifestPins(contents)),
			interaction
		)
};
