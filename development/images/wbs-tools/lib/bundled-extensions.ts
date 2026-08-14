export type BundledExtension = {
	id: string;
	name: string;
	description: string;
	defaultEnabled: boolean;
};

export const BUNDLED_EXTENSIONS: BundledExtension[] = [
	{
		id: 'EntitySchema.php',
		name: 'EntitySchema',
		description: 'Store and validate entity schemas.',
		defaultEnabled: true
	},
	{
		id: 'WikibaseLocalMedia.php',
		name: 'Wikibase Local Media',
		description: 'Use locally uploaded media in Wikibase statements.',
		defaultEnabled: true
	},
	{
		id: 'WikibaseManifest.php',
		name: 'Wikibase Manifest',
		description: 'Expose machine-readable information about this Wikibase.',
		defaultEnabled: true
	},
	{
		id: 'WikibaseInWikitext.php',
		name: 'Wikibase in Wikitext',
		description: 'Embed Wikibase values in wiki pages.',
		defaultEnabled: true
	},
	{
		id: 'Babel.php',
		name: 'Babel',
		description: 'Display the languages spoken by users.',
		defaultEnabled: true
	},
	{
		id: 'cldr.php',
		name: 'CLDR',
		description: 'Provide localized language and territory names.',
		defaultEnabled: true
	},
	{
		id: 'ConfirmEdit.php',
		name: 'ConfirmEdit',
		description: 'Add CAPTCHA-based protection against automated edits.',
		defaultEnabled: true
	},
	{
		id: 'Echo.php',
		name: 'Echo',
		description: 'Provide on-wiki notifications.',
		defaultEnabled: true
	},
	{
		id: 'Nuke.php',
		name: 'Nuke',
		description: 'Let administrators delete groups of pages.',
		defaultEnabled: true
	},
	{
		id: 'Scribunto.php',
		name: 'Scribunto',
		description: 'Run Lua modules from wiki templates.',
		defaultEnabled: true
	},
	{
		id: 'SyntaxHighlight_GeSHi.php',
		name: 'SyntaxHighlight',
		description: 'Add syntax highlighting to code blocks.',
		defaultEnabled: true
	},
	{
		id: 'UniversalLanguageSelector.php',
		name: 'Universal Language Selector',
		description: 'Let users select interface languages and input methods.',
		defaultEnabled: true
	},
	{
		id: 'VisualEditor.php',
		name: 'VisualEditor',
		description: 'Provide a visual editor for wiki pages.',
		defaultEnabled: true
	},
	{
		id: 'DiscussionTools.php',
		name: 'DiscussionTools',
		description: 'Improve workflows on wiki discussion pages.',
		defaultEnabled: true
	},
	{
		id: 'WikibaseEdtf.php',
		name: 'Wikibase EDTF',
		description: 'Add Extended Date/Time Format support.',
		defaultEnabled: false
	}
];
