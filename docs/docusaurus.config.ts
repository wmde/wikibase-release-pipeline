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
				path: 'deploy',
				routeBasePath: 'deploy',
				// includeCurrentVersion: false,
				versions: { current: { label: 'deploy-next' } }
			}
		],
		[
			'@docusaurus/plugin-content-docs',
			{
				id: 'wikibase',
				path: 'wikibase',
				routeBasePath: 'wikibase',
				// includeCurrentVersion: false,
				versions: { current: { label: 'wikibase-next' } }
			}
		],
		[
			'@docusaurus/plugin-content-docs',
			{
				id: 'wdqs',
				path: 'wdqs',
				routeBasePath: 'wdqs',
				// includeCurrentVersion: false,
				versions: { current: { label: 'wdqs-next' } }
			}
		],
		[
			'@docusaurus/plugin-content-docs',
			{
				id: 'wdqs-frontend',
				path: 'wdqs-frontend',
				routeBasePath: 'wdqs-frontend',
				// includeCurrentVersion: false,
				versions: { current: { label: 'wdqs-frontend-next' } }
			}
		],
		[
			'@docusaurus/plugin-content-docs',
			{
				id: 'wdqs-proxy',
				path: 'wdqs-proxy',
				routeBasePath: 'wdqs-proxy',
				// includeCurrentVersion: false,
				versions: { current: { label: 'wdqs-proxy-next' } }
			}
		],
		[
			'@docusaurus/plugin-content-docs',
			{
				id: 'quickstatements',
				path: 'quickstatements',
				routeBasePath: 'quickstatements',
				// includeCurrentVersion: false,
				versions: { current: { label: 'quickstatements-next' } }
			}
		],
		[
			'@docusaurus/plugin-content-docs',
			{
				id: 'elasticsearch',
				path: 'elasticsearch',
				routeBasePath: 'elasticsearch',
				// includeCurrentVersion: false,
				versions: { current: { label: 'elasticsearch-next' } }
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
							label: 'Report an issue',
							href: 'https://phabricator.wikimedia.org/maniphest/task/edit/form/129/'
						},
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
