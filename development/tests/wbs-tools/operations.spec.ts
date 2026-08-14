import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BUNDLED_EXTENSIONS } from '../../images/wbs-tools/lib/bundled-extensions.js';

const repositoryRoot = fileURLToPath(new URL('../../../', import.meta.url));

describe('WBS operations panel contracts', () => {
	it('exposes unique bundled extension controls with explicit defaults', () => {
		const ids = BUNDLED_EXTENSIONS.map((extension) => extension.id);
		assert.equal(new Set(ids).size, ids.length);
		assert.ok(
			BUNDLED_EXTENSIONS.every(
				(extension) => extension.name && extension.description
			)
		);
		assert.equal(
			BUNDLED_EXTENSIONS.find(
				(extension) => extension.id === 'WikibaseEdtf.php'
			)?.defaultEnabled,
			false
		);
	});

	it('keeps panel controls aligned with image extension loaders', () => {
		const loaders = readFileSync(
			join(
				repositoryRoot,
				'development/images/wikibase/configuration/ExtensionLoaders.php'
			),
			'utf8'
		);
		for (const extension of BUNDLED_EXTENSIONS) {
			assert.ok(
				loaders.includes(`'${extension.id}'`),
				`${extension.id} is not registered.`
			);
		}
		assert.match(loaders, /\/config\/WBSExtensions\.json/u);
		assert.match(
			loaders,
			/empty\( \$wbsExtensionState\['VisualEditor\.php'\] \)[\s\S]*\$wbsExtensionState\['DiscussionTools\.php'\] = false/u
		);
	});

	it('decomposes the root stack into the five service groups', () => {
		const compose = readFileSync(
			join(repositoryRoot, 'docker-compose.yml'),
			'utf8'
		);
		for (const file of [
			'wikibase.yml',
			'query-service.yml',
			'quickstatements.yml',
			'proxy.yml',
			'wbs-tools.yml'
		]) {
			assert.ok(
				compose.includes(`compose/${file}`),
				`${file} is not included.`
			);
		}
	});

	it('keeps privileged instance access out of the web service', () => {
		const compose = readFileSync(
			join(repositoryRoot, 'compose/wbs-tools.yml'),
			'utf8'
		);
		const [webService, controllerService] = compose.split(
			/^ {2}wbs-tools-controller:/mu
		);
		assert.doesNotMatch(
			webService,
			/docker\.sock|\bWBS_DIR\b|\.env|\/config(?:[/:\s]|$)/u
		);
		assert.match(webService, /wbs-operations-data/u);
		assert.match(
			controllerService,
			/docker\.sock|WBS_DIR|wbs-operations-data/u
		);
		assert.doesNotMatch(compose, /profiles:|ports:|SSL_CERT|ACCESS_CODE/u);
	});

	it('routes the always-on panel through the Wikibase host', () => {
		const proxy = readFileSync(
			join(repositoryRoot, 'config/traefik-dynamic.yml'),
			'utf8'
		);
		assert.match(proxy, /PathPrefix\(`\/tools\/configure`\)/u);
		assert.match(proxy, /url: "http:\/\/wbs-tools:80"/u);
	});

	it('authorizes instance administration through a dedicated MediaWiki right', () => {
		const extension = JSON.parse(
			readFileSync(
				join(
					repositoryRoot,
					'development/images/wikibase/extensions/WikibaseSuite/extension.json'
				),
				'utf8'
			)
		) as {
			AvailableRights: string[];
			GroupPermissions: Record<string, Record<string, boolean>>;
		};
		assert.ok(extension.AvailableRights.includes('wbs-manage-instance'));
		assert.equal(extension.GroupPermissions.sysop['wbs-manage-instance'], true);
	});

	it('recreates only the PHP services when applying extension settings', () => {
		const controller = readFileSync(
			join(
				repositoryRoot,
				'development/images/wbs-tools/lib/operations-controller.ts'
			),
			'utf8'
		);
		assert.match(
			controller,
			/'up',[\s\S]*'--force-recreate',[\s\S]*'--no-deps',[\s\S]*'wikibase',[\s\S]*'wikibase-jobrunner'/u
		);
		assert.match(controller, /if \(!recreateForApply\) \{/u);
	});

	it('stores panel-managed wiki settings separately from generated settings', () => {
		const controller = readFileSync(
			join(
				repositoryRoot,
				'development/images/wbs-tools/lib/operations-controller.ts'
			),
			'utf8'
		);
		const settings = readFileSync(
			join(
				repositoryRoot,
				'development/images/wikibase/configuration/WBSSettings.php'
			),
			'utf8'
		);
		assert.match(controller, /config', 'WBSConfig\.json/u);
		assert.match(settings, /\/config\/WBSConfig\.json/u);
		assert.match(settings, /\$wgSitename = \$wbsManagedConfig\['siteName'\]/u);
		for (const permission of [
			'read',
			'createaccount',
			'edit',
			'createpage',
			'property-create'
		]) {
			assert.ok(settings.includes(`$wgGroupPermissions['*']['${permission}']`));
		}
	});

	it('ships the Wikibase logo as the default site wordmark', () => {
		const settings = readFileSync(
			join(
				repositoryRoot,
				'development/images/wikibase/configuration/WBSSettings.php'
			),
			'utf8'
		);
		const logo = readFileSync(
			join(
				repositoryRoot,
				'development/images/wikibase/extensions/WikibaseSuite/resources/wikibase-logo.webp'
			)
		);
		assert.match(
			settings,
			/extensions\/WikibaseSuite\/resources\/wikibase-logo\.webp/u
		);
		assert.match(settings, /'wordmark' => \[/u);
		assert.equal(logo.subarray(0, 4).toString('ascii'), 'RIFF');
		assert.equal(logo.subarray(8, 12).toString('ascii'), 'WEBP');
	});

	it('keeps Wikimedia OAuth secrets out of browser-readable state', () => {
		const controller = readFileSync(
			join(
				repositoryRoot,
				'development/images/wbs-tools/lib/operations-controller.ts'
			),
			'utf8'
		);
		const stateWriter = controller.slice(
			controller.indexOf('function writeOperationsState'),
			controller.indexOf('function applySettings')
		);
		assert.match(stateWriter, /secretConfigured/u);
		assert.doesNotMatch(stateWriter, /secretToken:/u);
		assert.match(controller, /WIKIMEDIA_OAUTH_CONSUMER_TOKEN/u);
		assert.match(controller, /WIKIMEDIA_OAUTH_SECRET_TOKEN/u);
	});

	it('presents compact configuration sections and Wikimedia setup help', () => {
		const client = readFileSync(
			join(
				repositoryRoot,
				'development/images/wbs-tools/web/client/OperationsApp.vue'
			),
			'utf8'
		);
		for (const heading of [
			'General',
			'Access and editing',
			'Enable login with Wikimedia',
			'Extensions',
			'Instance operations'
		]) {
			assert.ok(client.includes(`<h2>${heading}</h2>`));
		}
		assert.match(client, /Back to Wikibase/u);
		assert.match(client, /OAuthConsumerRegistration\/propose\/oauth1a/u);
		assert.match(client, /Special:PluggableAuthLogin/u);
		assert.match(client, /Search extensions/u);
	});

	it('organizes settings into independently saved tabs', () => {
		const client = readFileSync(
			join(
				repositoryRoot,
				'development/images/wbs-tools/web/client/OperationsApp.vue'
			),
			'utf8'
		);
		const routes = readFileSync(
			join(
				repositoryRoot,
				'development/images/wbs-tools/web/routes/operations.ts'
			),
			'utf8'
		);
		const controller = readFileSync(
			join(
				repositoryRoot,
				'development/images/wbs-tools/lib/operations-controller.ts'
			),
			'utf8'
		);
		for (const label of [
			'General',
			'Extensions',
			'Login with Wikimedia',
			'Maintenance'
		]) {
			assert.ok(client.includes(`label: "${label}"`));
		}
		assert.match(client, /role="tablist"/u);
		assert.match(client, /saveGeneral/u);
		assert.match(client, /saveExtensions/u);
		assert.match(client, /saveWikimediaLogin/u);
		assert.doesNotMatch(client, /saveSettings|Save configuration/u);
		for (const scope of ['general', 'extensions', 'wikimedia-login']) {
			assert.ok(
				routes.includes(`router.post('/settings/${scope}'`),
				`${scope} does not have its own settings endpoint.`
			);
			assert.ok(
				controller.includes(`scope: '${scope}'`),
				`${scope} is not independently applied.`
			);
		}
	});

	it('keeps polling while MediaWiki restarts', () => {
		const client = readFileSync(
			join(
				repositoryRoot,
				'development/images/wbs-tools/web/client/OperationsApp.vue'
			),
			'utf8'
		);
		assert.match(client, /\[502, 503, 504\]\.includes\(response\.status\)/u);
		assert.match(client, /result\.status !== "complete"/u);
	});

	it('stores MediaWiki sessions outside the recreated PHP containers', () => {
		const settings = readFileSync(
			join(
				repositoryRoot,
				'development/images/wikibase/configuration/WBSSettings.php'
			),
			'utf8'
		);
		assert.match(settings, /\$wgSessionCacheType = CACHE_DB;/u);
		const bootstrap = readFileSync(
			join(
				repositoryRoot,
				'development/images/wikibase/bootstrap/bootstrap.sh'
			),
			'utf8'
		);
		const preservation = readFileSync(
			join(
				repositoryRoot,
				'development/images/wikibase/bootstrap/preserveSessions.php'
			),
			'utf8'
		);
		assert.match(bootstrap, /preserveSessions\.php[\s\S]*export/u);
		assert.match(bootstrap, /preserveSessions\.php[\s\S]*import/u);
		assert.match(preservation, /makeKey\( 'MWSession' \)/u);
		assert.match(preservation, /newReplaceQueryBuilder/u);
	});

	it('adds permission-aware instance tools to the sidebar dynamically', () => {
		const extension = JSON.parse(
			readFileSync(
				join(
					repositoryRoot,
					'development/images/wikibase/extensions/WikibaseSuite/extension.json'
				),
				'utf8'
			)
		) as { Hooks: Record<string, string> };
		const hooks = readFileSync(
			join(
				repositoryRoot,
				'development/images/wikibase/extensions/WikibaseSuite/includes/Hooks.php'
			),
			'utf8'
		);
		assert.ok(extension.Hooks.SidebarBeforeOutput);
		assert.match(hooks, /isAllowed\( 'wbs-manage-instance' \)/u);
		assert.match(hooks, /isAllowed\( 'edit' \)/u);
		assert.match(hooks, /isAllowed\( 'createpage' \)/u);
		assert.match(hooks, /isAllowed\( 'property-create' \)/u);
		assert.match(hooks, /SpecialPage::getTitleFor\( 'NewItem' \)/u);
		assert.match(hooks, /SpecialPage::getTitleFor\( 'NewProperty' \)/u);
		assert.match(hooks, /SpecialPage::getTitleFor\( 'AllPages' \)/u);
		assert.match(hooks, /SpecialPage::getTitleFor\( 'ListProperties' \)/u);
		assert.match(hooks, /array_search\( 'TOOLBOX'/u);
		assert.match(hooks, /insertBeforeToolbox\( \$sidebar, \$sections \)/u);
		assert.match(hooks, /WDQS_PUBLIC_FRONTEND_URL/u);
		assert.match(hooks, /QUICKSTATEMENTS_PUBLIC_URL/u);
		assert.match(hooks, /\/tools\/configure\//u);
		assert.match(hooks, /onBeforePageDisplay/u);
		assert.match(hooks, /getSkinName\(\) !== 'vector-2022'/u);
		assert.match(hooks, /pinAnonymousMainMenu/u);
		const pinning = readFileSync(
			join(
				repositoryRoot,
				'development/images/wikibase/extensions/WikibaseSuite/resources/pinAnonymousMainMenu.js'
			),
			'utf8'
		);
		assert.match(pinning, /vector-main-menu-pinned-container/u);
		assert.match(pinning, /vector-feature-main-menu-pinned-enabled/u);
		assert.match(pinning, /pinnedContainer\.append\( menu \)/u);
	});

	it('creates the onboarding Main Page only during a fresh installation', () => {
		const installer = readFileSync(
			join(
				repositoryRoot,
				'development/images/wikibase/default-extra-install.sh'
			),
			'utf8'
		);
		const maintenance = readFileSync(
			join(
				repositoryRoot,
				'development/images/wikibase/extensions/WikibaseSuite/maintenance/createBootstrapMainPage.php'
			),
			'utf8'
		);
		const content = readFileSync(
			join(
				repositoryRoot,
				'development/images/wikibase/extensions/WikibaseSuite/resources/bootstrap-main-page.wikitext'
			),
			'utf8'
		);
		assert.match(installer, /createBootstrapMainPage\.php/u);
		assert.match(maintenance, /getParentId\(\) !== 0/u);
		assert.match(maintenance, /getName\(\) === 'MediaWiki default'/u);
		assert.match(maintenance, /leaving it unchanged/u);
		assert.match(content, /== Welcome to Wikibase ==/u);
		assert.match(content, /== Configuring your instance ==/u);
		assert.match(content, /== How to create items and properties ==/u);
		assert.match(content, /https:\/\/wmde\.github\.io\/wikibase-suite\//u);
		assert.doesNotMatch(content, /github\.com\/wmde\/wikibase-suite/u);
	});

	it('links installer help to the published documentation site', () => {
		for (const [file, route] of [
			['BasicsStep.vue', 'docs/install/'],
			['InstallationStep.vue', 'docs/operate/troubleshooting.html'],
			['WelcomeStep.vue', 'docs/operate/reset.html']
		]) {
			const component = readFileSync(
				join(
					repositoryRoot,
					'development/images/wbs-tools/web/client/components',
					file
				),
				'utf8'
			);
			assert.ok(
				component.includes(`https://wmde.github.io/wikibase-suite/${route}`)
			);
			assert.doesNotMatch(
				component,
				/github\.com\/wmde\/wikibase-suite\/blob/u
			);
		}
	});
});
