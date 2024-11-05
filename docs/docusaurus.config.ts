import type { Config } from '@docusaurus/types';

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
	i18n: {
		defaultLocale: 'en',
		locales: ['en']
	},

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

	themes: [['@docusaurus/theme-classic', {}]],
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
				routeBasePath: 'deploy'
				//         sidebarPath: './sidebars.ts',
				//         // Please change this to your repo.
				//         // Remove this to remove the "edit this page" links.
				// editUrl:
				// 	'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/'
			}
		]
		// ['@docusaurus/plugin-content-docs', {id: 'docs3', path: 'api'}],
	]

	// themeConfig: {
	// //   // Replace with your project's social card
	//   image: 'img/docusaurus-social-card.jpg',
	//   navbar: {
	//     title: 'Wikibase Suite',
	//     logo: {
	//       alt: 'My Site Logo',
	//       src: 'img/logo.svg',
	//     },
	//     items: [
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
	//     ],
	//   },
	//   footer: {
	//     style: 'dark',
	//     links: [
	//       {
	//         title: 'Docs',
	//         items: [
	//           {
	//             label: 'Tutorial',
	//             to: '/docs/intro',
	//           },
	//         ],
	//       },
	//       {
	//         title: 'Community',
	//         items: [
	//           {
	//             label: 'Stack Overflow',
	//             href: 'https://stackoverflow.com/questions/tagged/docusaurus',
	//           },
	//           {
	//             label: 'Discord',
	//             href: 'https://discordapp.com/invite/docusaurus',
	//           },
	//           {
	//             label: 'Twitter',
	//             href: 'https://twitter.com/docusaurus',
	//           },
	//         ],
	//       },
	//       {
	//         title: 'More',
	//         items: [
	//           {
	//             label: 'Blog',
	//             to: '/blog',
	//           },
	//           {
	//             label: 'GitHub',
	//             href: 'https://github.com/facebook/docusaurus',
	//           },
	//         ],
	//       },
	//     ],
	//     copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
	//   },
	//   prism: {
	//     theme: prismThemes.github,
	//     darkTheme: prismThemes.dracula,
	//   },
	// } satisfies Preset.ThemeConfig,
};

export default config;
