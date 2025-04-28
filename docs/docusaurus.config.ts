import type * as Preset from '@docusaurus/preset-classic';
import type { Config } from '@docusaurus/types';
import { themes as prismThemes } from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
	title: 'Wikibase Suite',
	tagline: 'Because for some reason, you decided to host a Wikibase',
	favicon: 'img/wikibase-symbol/wikibase_rgb.svg',

	// Set the production url of your site here
	url: 'https://your-docusaurus-site.example.com',
	// Set the /<baseUrl>/ pathname under which your site is served
	// For GitHub pages deployment, it is often '/<projectName>/'
	baseUrl: '/',

	// GitHub pages deployment config.
	// If you aren't using GitHub pages, you don't need these.
	organizationName: 'wmde', // Usually your GitHub org/user name.
	projectName: 'wikibase-release-pipeline', // Usually your repo name.

	onBrokenLinks: 'throw',
	onBrokenMarkdownLinks: 'warn',

	// Even if you don't use internationalization, you can use this field to set
	// useful metadata like html lang. For example, if your site is Chinese, you
	// may want to replace "en" with "zh-Hans".
	i18n: { defaultLocale: 'en', locales: [ 'en' ] },

	presets: [
		[
			'classic',
			{
				docs: {
					sidebarPath: './sidebars.ts'
					// Please change this to your repo.
					// Remove this to remove the "edit this page" links.
					// editUrl:
					// 	'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/'
				},
				// blog: {
				// 	showReadingTime: true,
				// 	feedOptions: { type: ['rss', 'atom'], xslt: true },
				// 	// Please change this to your repo.
				// 	// Remove this to remove the "edit this page" links.
				// 	// editUrl:
				// 	// 	'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
				// 	// Useful options to enforce blogging best practices
				// 	onInlineTags: 'warn',
				// 	onInlineAuthors: 'warn',
				// 	onUntruncatedBlogPosts: 'warn'
				// },
				theme: { customCss: './src/css/custom.css' }
			} satisfies Preset.Options
		]
	],

	themeConfig: {
		// Replace with your project's social card
		// image: 'img/docusaurus-social-card.jpg',
		navbar: {
			// title: 'Wikibase Suite',
			logo: {
				alt: 'Wikibase Suite',
				src: 'img/wikibase-symbol/wikibase_black.svg'
			},
			items: [
				{
					type: 'docSidebar',
					sidebarId: 'tutorialSidebar',
					position: 'left',
					label: 'Docs'
				},
				// { to: '/blog', label: 'Blog', position: 'left' },
				{
					href: 'https://github.com/wmde/wikibase-release-pipeline/',
					label: 'GitHub',
					position: 'right'
				}
				// { type: 'docsVersionDropdown' }
			]
		},
		footer: {
			style: 'dark',
			links: [
				{
					title: 'Docs',
					items: [
						// { label: 'Tutorial', to: '/docs/intro' }
					]
				}
				// {
				// 	title: 'Community',
				// 	items: [
				// 		{
				// 			label: 'Stack Overflow',
				// 			href: 'https://stackoverflow.com/questions/tagged/docusaurus'
				// 		},
				// 		{
				// 			label: 'Discord',
				// 			href: 'https://discordapp.com/invite/docusaurus'
				// 		},
				// 		{ label: 'X', href: 'https://x.com/docusaurus' }
				// 	]
				// },
				// {
				// 	title: 'More',
				// 	items: [
				// 		{ label: 'Blog', to: '/blog' },
				// 		{ label: 'GitHub', href: 'https://github.com/facebook/docusaurus' }
				// 	]
				// }
			],
			copyright: `Copyright © ${ new Date().getFullYear() } WMDE. Built with Docusaurus.`
		},
		prism: { theme: prismThemes.github, darkTheme: prismThemes.dracula }
	} satisfies Preset.ThemeConfig
};

export default config;
