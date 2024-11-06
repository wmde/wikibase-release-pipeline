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

	// GitHub pages deployment config.
	// If you aren't using GitHub pages, you don't need these.
	organizationName: 'facebook', // Usually your GitHub org/user name.
	projectName: 'docusaurus', // Usually your repo name.

	onBrokenLinks: 'throw',
	onBrokenMarkdownLinks: 'warn',

	// Even if you don't use internationalization, you can use this field to set
	// useful metadata like html lang. For example, if your site is Chinese, you
	// may want to replace "en" with "zh-Hans".
	i18n: { defaultLocale: 'en', locales: ['en'] },

	// presets: [
	//   [
	//     'classic',
	//     {
	//       docs: {
	//         routeBasePath: '/', // Serve the docs at the site's root
	//         sidebarPath: './sidebars.ts',
	//         // Please change this to your repo.
	//         // Remove this to remove the "edit this page" links.
	//         editUrl:
	//           'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
	//       },
	//       blog: false,
	//       theme: {
	//         customCss: './src/css/custom.css',
	//       },
	//     } satisfies Preset.Options,
	//   ],
	// ],
	// // themes: ['@docusaurus/theme-classic'],
	// //
	// plugins: [
	//   // [
	//     '@docusaurus/plugin-content-docs',
	// //     {
	// //       id: 'main',
	// //       path: 'docs',
	// //       routeBasePath: '/test',
	// //       sidebarPath: './sidebars.ts',
	// //       // ... other options
	// //     },
	//   // ],
	// ],
	//

	themes: [
		['@docusaurus/theme-classic', { customCss: './src/css/custom.css' }]
	],
	plugins: [
		[
			'@docusaurus/plugin-content-docs',
			{
				id: 'landing',
				path: 'landing',
				routeBasePath: '/'
				//         sidebarPath: './sidebars.ts',
				//         // Please change this to your repo.
				//         // Remove this to remove the "edit this page" links.
				// editUrl:
				// 	'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/'
			}
		],
		[
			'@docusaurus/plugin-content-docs',
			{
				id: 'deploy',
				path: 'deploy',
				routeBasePath: 'deploy',
				includeCurrentVersion: false
				//         sidebarPath: './sidebars.ts',
				//         // Please change this to your repo.
				//         // Remove this to remove the "edit this page" links.
				// editUrl:
				// 	'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/'
			}
		],
		[
			'@docusaurus/plugin-content-docs',
			{
				id: 'wikibase',
				path: 'wikibase',
				routeBasePath: 'wikibase',
				includeCurrentVersion: false
				//         sidebarPath: './sidebars.ts',
				//         // Please change this to your repo.
				//         // Remove this to remove the "edit this page" links.
				// editUrl:
				// 	'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/'
			}
		],
		[
			'@docusaurus/plugin-content-docs',
			{
				id: 'wdqs',
				path: 'wdqs',
				routeBasePath: 'wdqs',
				includeCurrentVersion: false
				//         sidebarPath: './sidebars.ts',
				//         // Please change this to your repo.
				//         // Remove this to remove the "edit this page" links.
				// editUrl:
				// 	'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/'
			}
		],
		[
			'@docusaurus/plugin-content-docs',
			{
				id: 'wdqs-frontend',
				path: 'wdqs-frontend',
				routeBasePath: 'wdqs-frontend',
				includeCurrentVersion: false
				//         sidebarPath: './sidebars.ts',
				//         // Please change this to your repo.
				//         // Remove this to remove the "edit this page" links.
				// editUrl:
				// 	'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/'
			}
		],
		[
			'@docusaurus/plugin-content-docs',
			{
				id: 'wdqs-proxy',
				path: 'wdqs-proxy',
				routeBasePath: 'wdqs-proxy',
				includeCurrentVersion: false
				//         sidebarPath: './sidebars.ts',
				//         // Please change this to your repo.
				//         // Remove this to remove the "edit this page" links.
				// editUrl:
				// 	'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/'
			}
		],
		[
			'@docusaurus/plugin-content-docs',
			{
				id: 'quickstatements',
				path: 'quickstatements',
				routeBasePath: 'quickstatements',
				includeCurrentVersion: false
				//         sidebarPath: './sidebars.ts',
				//         // Please change this to your repo.
				//         // Remove this to remove the "edit this page" links.
				// editUrl:
				// 	'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/'
			}
		],
		[
			'@docusaurus/plugin-content-docs',
			{
				id: 'elasticsearch',
				path: 'elasticsearch',
				routeBasePath: 'elasticsearch',
				includeCurrentVersion: false
				//         sidebarPath: './sidebars.ts',
				//         // Please change this to your repo.
				//         // Remove this to remove the "edit this page" links.
				// editUrl:
				// 	'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/'
			}
		]
		// ['@docusaurus/plugin-content-docs', {id: 'docs3', path: 'api'}],
	],

	themeConfig: {
		//   // Replace with your project's social card
		image: 'img/docusaurus-social-card.jpg',
		navbar: {
			title: 'Wikibase Suite',
			//     logo: {
			//       alt: 'My Site Logo',
			//       src: 'img/logo.svg',
			//     },
			items: [
				{ type: 'docsVersionDropdown', docsPluginId: 'deploy' },
				{ type: 'docsVersionDropdown', docsPluginId: 'wikibase' },
				{ type: 'docsVersionDropdown', docsPluginId: 'wdqs' },
				{ type: 'docsVersionDropdown', docsPluginId: 'wdqs-frontend' },
				{ type: 'docsVersionDropdown', docsPluginId: 'wdqs-proxy' },
				{ type: 'docsVersionDropdown', docsPluginId: 'quickstatements' },
				{ type: 'docsVersionDropdown', docsPluginId: 'elasticsearch' }
				//       {
				//         type: 'docSidebar',
				//         sidebarId: 'tutorialSidebar',
				//         position: 'left',
				//         label: 'Tutorial',
				//       },
				//       {
				//         href: 'https://github.com/facebook/docusaurus',
				//         label: 'GitHub',
				//         position: 'right',
				//       },
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
							to: 'https://wikiba.se'
						},
						{
							label: 'MediaWiki.org',
							to: 'https://www.mediawiki.org/wiki/Wikibase'
						},
						{
							label: 'Github',
							to: 'https://github.com/wmde/wikibase-release-pipeline'
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
			// TODO: docs license?
			// copyright: `Copyright © ${new Date().getFullYear()} Wikimedia Germany.
			// Built with Docusaurus.`,
		},
		prism: {
			theme: prismThemes.github,
			darkTheme: prismThemes.dracula
		}
	} satisfies Preset.ThemeConfig
};

export default config;
