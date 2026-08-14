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
		id: 'Math.php',
		name: 'Math',
		description: 'Render mathematical formulas.',
		defaultEnabled: false
	},
	{
		id: 'PageImages.php',
		name: 'PageImages',
		description: 'Select representative images for wiki pages.',
		defaultEnabled: false
	},
	{
		id: 'TextExtracts.php',
		name: 'TextExtracts',
		description: 'Provide plain-text or limited-HTML page extracts.',
		defaultEnabled: false
	},
	{
		id: 'Cite.php',
		name: 'Cite',
		description: 'Add references and footnotes to wiki pages.',
		defaultEnabled: false
	},
	{
		id: 'WikiEditor.php',
		name: 'WikiEditor',
		description: 'Enhance the source editor with a toolbar and usability features.',
		defaultEnabled: false
	},
	{
		id: 'CodeEditor.php',
		name: 'CodeEditor',
		description: 'Provide an editor for JavaScript and CSS pages.',
		defaultEnabled: false
	},
	{
		id: 'SecureLinkFixer.php',
		name: 'SecureLinkFixer',
		description: 'Rewrite eligible external links to use HTTPS.',
		defaultEnabled: false
	},
	{
		id: 'Thanks.php',
		name: 'Thanks',
		description: 'Let users privately thank editors for contributions.',
		defaultEnabled: false
	},
	{
		id: 'Poem.php',
		name: 'Poem',
		description: 'Add formatting for poems and similarly structured text.',
		defaultEnabled: false
	},
	{
		id: 'TemplateData.php',
		name: 'TemplateData',
		description: 'Store structured descriptions of template parameters.',
		defaultEnabled: false
	},
	{
		id: 'ParserFunctions.php',
		name: 'ParserFunctions',
		description: 'Add logical and string functions to wikitext.',
		defaultEnabled: false
	},
	{
		id: 'MultimediaViewer.php',
		name: 'MultimediaViewer',
		description: 'Display images in a full-screen media viewer.',
		defaultEnabled: false
	},
	{
		id: 'SpamBlacklist.php',
		name: 'SpamBlacklist',
		description: 'Block edits containing links from configured blacklists.',
		defaultEnabled: false
	},
	{
		id: 'Parsoid.php',
		name: 'Parsoid',
		description: 'Expose Parsoid parsing through MediaWiki.',
		defaultEnabled: false
	},
	{
		id: 'RevisionSlider.php',
		name: 'RevisionSlider',
		description: 'Navigate and compare revisions visually on diff pages.',
		defaultEnabled: false
	},
	{
		id: 'TorBlock.php',
		name: 'TorBlock',
		description: 'Restrict editing through known Tor exit nodes.',
		defaultEnabled: false
	},
	{
		id: 'JsonConfig.php',
		name: 'JsonConfig',
		description: 'Store validated JSON configuration in wiki pages.',
		defaultEnabled: false
	},
	{
		id: 'Kartographer.php',
		name: 'Kartographer',
		description: 'Embed interactive maps in wiki pages.',
		defaultEnabled: false
	},
	{
		id: 'TemplateSandbox.php',
		name: 'TemplateSandbox',
		description: 'Preview pages using sandbox versions of templates and modules.',
		defaultEnabled: false
	},
	{
		id: 'CodeMirror.php',
		name: 'CodeMirror',
		description: 'Add syntax highlighting and editing aids to source editing.',
		defaultEnabled: false
	},
	{
		id: 'AdvancedSearch.php',
		name: 'AdvancedSearch',
		description: 'Provide an accessible form for advanced search options.',
		defaultEnabled: false
	},
	{
		id: 'WikiHiero.php',
		name: 'WikiHiero',
		description: 'Render Egyptian hieroglyphs from wiki syntax.',
		defaultEnabled: false
	},
	{
		id: 'TwoColConflict.php',
		name: 'TwoColConflict',
		description: 'Provide a two-column interface for resolving edit conflicts.',
		defaultEnabled: false
	},
	{
		id: 'StopForumSpam.php',
		name: 'StopForumSpam',
		description: 'Check account creation against the Stop Forum Spam service.',
		defaultEnabled: false
	},
	{
		id: 'MobileFrontend.php',
		name: 'MobileFrontend',
		description: 'Provide a mobile-optimized wiki experience.',
		defaultEnabled: false
	},
	{
		id: 'ConfirmAccount.php',
		name: 'ConfirmAccount',
		description: 'Require administrators to approve account requests.',
		defaultEnabled: false
	},
	{
		id: 'InviteSignup.php',
		name: 'InviteSignup',
		description: 'Let authorized users invite people to create accounts.',
		defaultEnabled: false
	},
	{
		id: 'WikibaseLexeme.php',
		name: 'Wikibase Lexeme',
		description: 'Add lexemes, forms, and senses for structured lexical data.',
		defaultEnabled: false
	},
	{
		id: 'WikibaseLexemeCirrusSearch.php',
		name: 'Wikibase Lexeme CirrusSearch',
		description: 'Index and search Wikibase Lexeme entities with OpenSearch.',
		defaultEnabled: false
	},
	{
		id: 'WikibaseEdtf.php',
		name: 'Wikibase EDTF',
		description: 'Add Extended Date/Time Format support.',
		defaultEnabled: false
	}
];
