import type * as Preset from '@docusaurus/preset-classic';
import type { Config } from '@docusaurus/types';
import { themes as prismThemes } from 'prism-react-renderer';

const config: Config = {
	title: 'Wikibase Suite Deploy',
	tagline: 'containerized, production-ready Wikibase system',
	favicon: 'img/favicon.ico',

	// Set the production url of your site here
	url: 'https://your-docusaurus-site.example.com',
	// Set the /<baseUrl>/ pathname under which your site is served
	// For GitHub pages deployment, it is often '/<projectName>/'
	baseUrl: '/',

	organizationName: 'wmde',
	projectName: 'wikibase-release-pipeline',

	onBrokenLinks: 'throw',
	onBrokenMarkdownLinks: 'warn',
	i18n: { defaultLocale: 'en', locales: ['en'] },

	themes: [
		['@docusaurus/theme-classic', { customCss: './src/css/custom.css' }]
	],

	plugins: [
		[
			'@docusaurus/plugin-content-docs',
			{ id: 'landing', path: 'landing', routeBasePath: '/' }
		],
		[
			'@docusaurus/plugin-content-docs',
			{
				id: 'deploy',
				routeBasePath: 'deploy',
				includeCurrentVersion: false
			}
		],
		[
			'@docusaurus/plugin-content-docs',
			{
				id: 'wikibase',
				routeBasePath: 'wikibase',
				includeCurrentVersion: false
			}
		],
		[
			'@docusaurus/plugin-content-docs',
			{
				id: 'wdqs',
				routeBasePath: 'wdqs',
				includeCurrentVersion: false
			}
		],
		[
			'@docusaurus/plugin-content-docs',
			{
				id: 'wdqs-frontend',
				routeBasePath: 'wdqs-frontend',
				includeCurrentVersion: false
			}
		],
		[
			'@docusaurus/plugin-content-docs',
			{
				id: 'wdqs-proxy',
				routeBasePath: 'wdqs-proxy',
				includeCurrentVersion: false
			}
		],
		[
			'@docusaurus/plugin-content-docs',
			{
				id: 'quickstatements',
				routeBasePath: 'quickstatements',
				includeCurrentVersion: false
			}
		],
		[
			'@docusaurus/plugin-content-docs',
			{
				id: 'elasticsearch',
				routeBasePath: 'elasticsearch',
				includeCurrentVersion: false
			}
		]
	],

	themeConfig: {
		image: 'img/docusaurus-social-card.jpg',
		navbar: {
			title: 'Wikibase Suite',
			items: [
				{ type: 'docsVersionDropdown', docsPluginId: 'deploy' },
				{ type: 'docsVersionDropdown', docsPluginId: 'wikibase' },
				{ type: 'docsVersionDropdown', docsPluginId: 'wdqs' },
				{ type: 'docsVersionDropdown', docsPluginId: 'wdqs-frontend' },
				{ type: 'docsVersionDropdown', docsPluginId: 'wdqs-proxy' },
				{ type: 'docsVersionDropdown', docsPluginId: 'quickstatements' },
				{ type: 'docsVersionDropdown', docsPluginId: 'elasticsearch' }
			]
		},
		footer: {
			style: 'dark',
			links: [
				{
					title: 'Resources',
					items: [
						{
							label: 'Wikiba.se',
							href: 'https://wikiba.se'
						},
						{
							label: 'MediaWiki.org',
							href: 'https://www.mediawiki.org/wiki/Wikibase'
						},
						{
							label: 'Github',
							href: 'https://github.com/wmde/wikibase-release-pipeline'
						}
					]
				},
				{
					title: 'Community',
					items: [
						{
							label: 'Telegram User Group',
							href: 'https://t.me/joinchat/HGjGexZ9NE7BwpXzMsoDLA'
						},
						{
							label: 'Mailing List',
							href: 'https://lists.wikimedia.org/postorius/lists/wikibaseug.lists.wikimedia.org/'
						}
					]
				}
			]
		},
		prism: {
			theme: prismThemes.github,
			darkTheme: prismThemes.dracula
		}
	} satisfies Preset.ThemeConfig
};

export default config;
