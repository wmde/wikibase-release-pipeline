<template>
	<main class="page-shell operations-page">
		<div class="operations-layout">
			<header class="installer-header operations-header">
				<div class="installer-header__brand">
					<img :src="logoSrc" alt="Wikibase Suite" />
				</div>
				<div class="installer-header__identity">
					<a v-if="wikibaseUrl" :href="wikibaseUrl" class="operations-back-link"
						>← Back to Wikibase</a
					>
					<h1>Configure</h1>
					<small v-if="userName">Signed in as {{ userName }}</small>
				</div>
			</header>

			<cdx-message
				v-if="message"
				:type="messageType"
				class="operations-message"
				>{{ message }}</cdx-message
			>

			<section v-if="authLoading" class="surface-card operations-section">
				Loading account…
			</section>

			<section
				v-else-if="!authenticated"
				class="surface-card operations-section"
			>
				<header>
					<h2>Sign in with your Wikibase administrator account</h2>
					<p>
						This panel uses your existing Wikibase login. Your account must have
						permission to manage the instance.
					</p>
				</header>
				<div class="operation-actions">
					<a :href="loginUrl" target="_blank" rel="noopener"
						>Sign in to Wikibase</a
					>
					<cdx-button @click="checkAuthorization">Check sign-in</cdx-button>
				</div>
			</section>

			<template v-else>
				<section v-if="loading" class="surface-card operations-section">
					Loading configuration…
				</section>

				<template v-else>
					<nav
						class="operations-tabs"
						role="tablist"
						aria-label="Configuration areas"
					>
						<button
							v-for="tab in tabs"
							:id="`operations-tab-${tab.id}`"
							:key="tab.id"
							type="button"
							role="tab"
							:aria-selected="activeTab === tab.id"
							:aria-controls="`operations-panel-${tab.id}`"
							:class="{ 'is-active': activeTab === tab.id }"
							@click="selectTab(tab.id)"
						>
							{{ tab.label }}
						</button>
					</nav>

					<div
						v-if="activeTab === 'general'"
						id="operations-panel-general"
						class="operations-tab-panel"
						role="tabpanel"
						aria-labelledby="operations-tab-general"
					>
						<section class="surface-card operations-section">
							<header>
								<h2>General</h2>
								<p>Set the public identity and visibility of this Wikibase.</p>
							</header>
							<label class="settings-field">
								<strong>Site name</strong>
								<input
									v-model="siteName"
									type="text"
									maxlength="255"
									:disabled="busy"
								/>
								<small
									>Shown in page titles and throughout the wiki
									interface.</small
								>
							</label>
							<label class="settings-toggle-row">
								<span>
									<strong>Share ecosystem statistics</strong>
									<small
										>Include this Wikibase in Wikimedia Deutschland’s public
										instance counts and software-version statistics once a week.
										No personal data is collected.</small
									>
								</span>
								<input
									v-model="metadataCallback"
									type="checkbox"
									:disabled="busy"
								/>
							</label>
						</section>

						<section class="surface-card operations-section">
							<header>
								<h2>Access and editing</h2>
								<p>
									Control who can view the wiki, create accounts, and
									contribute.
								</p>
							</header>
							<div class="settings-list">
								<label
									v-for="setting in accessControls"
									:key="setting.key"
									class="settings-toggle-row"
								>
									<span>
										<strong>{{ setting.label }}</strong>
										<small>{{ setting.description }}</small>
									</span>
									<input
										v-model="access[setting.key]"
										type="checkbox"
										:disabled="busy || setting.disabled()"
										@change="normalizeAccess"
									/>
								</label>
							</div>
						</section>
						<div class="operations-save-area">
							<p class="operations-save-warning">
								Changing ecosystem-statistics sharing restarts Wikibase and may
								make the instance unavailable for approximately 30–60 seconds.
								Other general settings apply without interruption.
							</p>
							<cdx-button
								action="progressive"
								weight="primary"
								:disabled="busy || !siteName.trim() || !generalDirty"
								@click="saveGeneral"
							>
								{{ busy ? "Saving…" : "Save" }}
							</cdx-button>
						</div>
					</div>

					<div
						v-else-if="activeTab === 'wikimedia-login'"
						id="operations-panel-wikimedia-login"
						class="operations-tab-panel"
						role="tabpanel"
						aria-labelledby="operations-tab-wikimedia-login"
					>
						<section class="surface-card operations-section">
							<header>
								<h2>Enable login with Wikimedia</h2>
								<p>
									Let people use the same Wikimedia account they use on
									Wikidata, Wikipedia, and other Wikimedia projects. A
									corresponding local account is created the first time they
									sign in.
								</p>
							</header>
							<div class="wikimedia-login-help">
								<p>
									<a
										href="https://meta.wikimedia.org/wiki/Special:OAuthConsumerRegistration/propose/oauth1a"
										target="_blank"
										rel="noopener"
										>Register an OAuth 1.0a consumer on Wikimedia</a
									>. Describe your Wikibase, keep the default basic permissions,
									and use this callback URL:
								</p>
								<code>{{ callbackUrl }}</code>
								<p>
									Copy the consumer token and secret token Wikimedia gives you
									below.
								</p>
							</div>
							<div class="settings-fields-grid">
								<label class="settings-field">
									<strong>Consumer token</strong>
									<input
										v-model="wikimediaConsumerToken"
										type="text"
										autocomplete="off"
										:disabled="busy"
									/>
								</label>
								<label class="settings-field">
									<strong>Secret token</strong>
									<input
										v-model="wikimediaSecretToken"
										type="password"
										autocomplete="new-password"
										:placeholder="
											wikimediaSecretConfigured
												? 'Configured — leave blank to keep'
												: ''
										"
										:disabled="busy"
									/>
								</label>
							</div>
							<p class="settings-note">
								The tokens are stored in plain text in the instance’s
								<code>.env</code>
								file. Clear the consumer token to disable Wikimedia login.
							</p>
						</section>
						<div class="operations-save-area">
							<p class="operations-save-warning">
								Saving changes here restarts Wikibase and may make the instance
								unavailable for approximately 30–60 seconds.
							</p>
							<cdx-button
								action="progressive"
								weight="primary"
								:disabled="busy || !wikimediaLoginDirty"
								@click="saveWikimediaLogin"
							>
								{{ busy ? "Saving…" : "Save" }}
							</cdx-button>
						</div>
					</div>

					<div
						v-else-if="activeTab === 'extensions'"
						id="operations-panel-extensions"
						class="operations-tab-panel"
						role="tabpanel"
						aria-labelledby="operations-tab-extensions"
					>
						<section class="surface-card operations-section extensions-section">
							<header>
								<h2>Extensions</h2>
								<p>Enable or disable extensions.</p>
							</header>
							<div class="extension-toolbar">
								<input
									v-model="extensionSearch"
									type="search"
									placeholder="Search extensions"
									aria-label="Search extensions"
								/>
								<div class="extension-filters" aria-label="Filter extensions">
									<button
										v-for="filter in extensionFilters"
										:key="filter"
										type="button"
										:class="{ 'is-active': extensionFilter === filter }"
										@click="extensionFilter = filter"
									>
										{{ filter }}
									</button>
								</div>
								<small
									>{{ filteredExtensions.length }} of
									{{ extensions.length }}</small
								>
							</div>
							<div class="extension-list">
								<label
									v-for="extension in filteredExtensions"
									:key="extension.id"
									class="extension-row"
								>
									<span>
										<strong>{{ extension.name }}</strong>
										<small>{{ extension.description }}</small>
									</span>
									<span class="extension-row__status">{{
										extension.enabled ? "Enabled" : "Disabled"
									}}</span>
									<input
										v-model="extension.enabled"
										type="checkbox"
										:disabled="busy"
									/>
								</label>
								<p v-if="filteredExtensions.length === 0" class="empty-state">
									No extensions match this filter.
								</p>
							</div>
						</section>

						<div class="operations-save-area">
							<p class="operations-save-warning">
								Saving extension changes restarts Wikibase and may make the
								instance unavailable for approximately 30–60 seconds.
							</p>
							<cdx-button
								action="progressive"
								weight="primary"
								:disabled="busy || !extensionsDirty"
								@click="saveExtensions"
							>
								{{ busy ? "Saving…" : "Save" }}
							</cdx-button>
						</div>
					</div>

					<div
						v-else
						id="operations-panel-maintenance"
						class="operations-tab-panel"
						role="tabpanel"
						aria-labelledby="operations-tab-maintenance"
					>
						<section class="surface-card operations-section">
							<header>
								<h2>Instance operations</h2>
								<p>
									These actions may briefly interrupt access to the instance.
								</p>
							</header>
							<div class="operation-actions">
								<div>
									<strong>Restart services</strong>
									<p>
										Restart all services using the current configuration and
										images.
									</p>
									<cdx-button :disabled="busy" @click="runAction('restart')"
										>Restart services</cdx-button
									>
								</div>
								<div>
									<strong>Update patch images</strong>
									<p>
										Pull the latest images selected by this WBS release and
										recreate changed services.
									</p>
									<cdx-button :disabled="busy" @click="runAction('update')"
										>Check for updates</cdx-button
									>
								</div>
							</div>
						</section>
					</div>
				</template>
			</template>
		</div>
	</main>
</template>

<script setup lang="ts">
import { CdxButton, CdxMessage } from "@wikimedia/codex";
import { computed, onMounted, reactive, ref } from "vue";

type ExtensionState = {
	id: string;
	name: string;
	description: string;
	defaultEnabled: boolean;
	enabled: boolean;
};
type AccessKey =
	| "publicRead"
	| "accountRegistration"
	| "anonymousEditing"
	| "anonymousItemCreation"
	| "anonymousPropertyCreation"
	| "uploads";
type ExtensionFilter = "All" | "Enabled" | "Disabled";
type MessageType = "success" | "error" | "notice";
type TabId = "general" | "extensions" | "wikimedia-login" | "maintenance";
type SettingsScope = "all" | Exclude<TabId, "maintenance">;

const basePath = window.__INSTALLER_STATE__?.basePath || "";
const logoSrc = `${basePath}/Wikibase_Suite_(RGB).png`;
const extensions = ref<ExtensionState[]>([]);
const siteName = ref("");
const metadataCallback = ref(false);
const access = reactive<Record<AccessKey, boolean>>({
	publicRead: true,
	accountRegistration: false,
	anonymousEditing: false,
	anonymousItemCreation: false,
	anonymousPropertyCreation: false,
	uploads: true
});
const wikimediaConsumerToken = ref("");
const wikimediaSecretToken = ref("");
const wikimediaSecretConfigured = ref(false);
const extensionSearch = ref("");
const extensionFilter = ref<ExtensionFilter>("All");
const extensionFilters: ExtensionFilter[] = ["All", "Enabled", "Disabled"];
const tabs: Array<{ id: TabId; label: string }> = [
	{ id: "general", label: "General" },
	{ id: "extensions", label: "Extensions" },
	{ id: "wikimedia-login", label: "Login with Wikimedia" },
	{ id: "maintenance", label: "Maintenance" }
];
const activeTab = ref<TabId>("general");
const savedGeneral = ref("");
const savedExtensions = ref("");
const savedWikimediaConsumerToken = ref("");
const loading = ref(true);
const authLoading = ref(true);
const authenticated = ref(false);
const userName = ref("");
const wikibaseUrl = ref("");
const loginUrl = ref("/wiki/Special:UserLogin");
const busy = ref(false);
const message = ref("");
const messageType = ref<MessageType>("notice");

const callbackUrl = computed(
	() => `${wikibaseUrl.value}/w/index.php?title=Special:PluggableAuthLogin`
);
const filteredExtensions = computed(() => {
	const search = extensionSearch.value.trim().toLowerCase();
	return extensions.value.filter((extension) => {
		const matchesText =
			!search ||
			`${extension.name} ${extension.description}`
				.toLowerCase()
				.includes(search);
		const matchesState =
			extensionFilter.value === "All" ||
			extension.enabled === (extensionFilter.value === "Enabled");
		return matchesText && matchesState;
	});
});
const generalDirty = computed(
	() => generalFingerprint() !== savedGeneral.value
);
const extensionsDirty = computed(
	() => extensionsFingerprint() !== savedExtensions.value
);
const wikimediaLoginDirty = computed(
	() =>
		wikimediaConsumerToken.value !== savedWikimediaConsumerToken.value ||
		wikimediaSecretToken.value.length > 0
);
const accessControls: Array<{
	key: AccessKey;
	label: string;
	description: string;
	disabled: () => boolean;
}> = [
	{
		key: "publicRead",
		label: "Public reading",
		description: "Allow visitors who are not signed in to view wiki content.",
		disabled: () => false
	},
	{
		key: "accountRegistration",
		label: "Account registration",
		description: "Allow visitors to create their own local accounts.",
		disabled: () => false
	},
	{
		key: "anonymousEditing",
		label: "Anonymous editing",
		description: "Allow visitors who are not signed in to edit existing pages.",
		disabled: () => false
	},
	{
		key: "anonymousItemCreation",
		label: "Anonymous item creation",
		description: "Allow anonymous editors to create new items.",
		disabled: () => !access.anonymousEditing
	},
	{
		key: "anonymousPropertyCreation",
		label: "Anonymous property creation",
		description: "Allow anonymous item creators to create new properties.",
		disabled: () => !access.anonymousItemCreation
	},
	{
		key: "uploads",
		label: "Local media uploads",
		description: "Allow authorized users to upload files to this Wikibase.",
		disabled: () => false
	}
];

function normalizeAccess(): void {
	if (!access.anonymousEditing) {
		access.anonymousItemCreation = false;
		access.anonymousPropertyCreation = false;
	} else if (!access.anonymousItemCreation) {
		access.anonymousPropertyCreation = false;
	}
}

function showMessage(text: string, type: MessageType): void {
	message.value = text;
	messageType.value = type;
}

function generalFingerprint(): string {
	return JSON.stringify({
		siteName: siteName.value.trim(),
		metadataCallback: metadataCallback.value,
		access: { ...access }
	});
}

function extensionsFingerprint(): string {
	return JSON.stringify(
		Object.fromEntries(
			extensions.value.map((extension) => [extension.id, extension.enabled])
		)
	);
}

function selectTab(tab: TabId): void {
	activeTab.value = tab;
	message.value = "";
}

async function loadState(scope: SettingsScope = "all"): Promise<void> {
	try {
		const response = await fetch(`${basePath}/operations/state`);
		if (!response.ok) throw new Error(await response.text());
		const state = (await response.json()) as {
			siteName: string;
			metadataCallback: boolean;
			access: Record<AccessKey, boolean>;
			wikimediaLogin: { consumerToken: string; secretConfigured: boolean };
			extensions: ExtensionState[];
		};
		if (scope === "all" || scope === "general") {
			siteName.value = state.siteName;
			metadataCallback.value = state.metadataCallback;
			Object.assign(access, state.access);
			normalizeAccess();
			savedGeneral.value = generalFingerprint();
		}
		if (scope === "all" || scope === "wikimedia-login") {
			wikimediaConsumerToken.value = state.wikimediaLogin.consumerToken;
			wikimediaSecretToken.value = "";
			wikimediaSecretConfigured.value = state.wikimediaLogin.secretConfigured;
			savedWikimediaConsumerToken.value = state.wikimediaLogin.consumerToken;
		}
		if (scope === "all" || scope === "extensions") {
			extensions.value = state.extensions;
			savedExtensions.value = extensionsFingerprint();
		}
	} catch (error) {
		showMessage(
			error instanceof Error ? error.message : String(error),
			"error"
		);
	} finally {
		if (scope === "all") loading.value = false;
	}
}

async function checkAuthorization(): Promise<void> {
	authLoading.value = true;
	message.value = "";
	try {
		const response = await fetch(`${basePath}/operations/auth/state`);
		const state = (await response.json()) as {
			authenticated: boolean;
			userName?: string;
			loginUrl: string;
			wikibaseUrl?: string;
			message?: string;
		};
		loginUrl.value = state.loginUrl;
		wikibaseUrl.value = state.wikibaseUrl || "";
		authenticated.value = state.authenticated;
		userName.value = state.userName || "";
		if (!response.ok && state.message) showMessage(state.message, "error");
		if (state.authenticated && loading.value) await loadState();
	} catch (error) {
		showMessage(
			error instanceof Error ? error.message : String(error),
			"error"
		);
	} finally {
		authLoading.value = false;
	}
}

async function waitForOperation(id: string): Promise<void> {
	const deadline = Date.now() + 120_000;
	while (true) {
		await new Promise((resolve) => window.setTimeout(resolve, 750));
		const response = await fetch(`${basePath}/operations/operations/${id}`);
		if ([502, 503, 504].includes(response.status) && Date.now() < deadline)
			continue;
		if (!response.ok) throw new Error(await response.text());
		const result = (await response.json()) as {
			status: string;
			message?: string;
		};
		if (result.status === "running") continue;
		if (result.status === "failed")
			throw new Error(result.message || "The operation failed.");
		if (result.status !== "complete")
			throw new Error(result.message || "The operation returned no status.");
		showMessage(result.message || "Operation complete.", "success");
		return;
	}
}

async function request(url: string, body?: object): Promise<boolean> {
	busy.value = true;
	message.value = "";
	try {
		const response = await fetch(url, {
			method: "POST",
			headers: body ? { "Content-Type": "application/json" } : undefined,
			body: body ? JSON.stringify(body) : undefined
		});
		if (!response.ok) throw new Error(await response.text());
		const result = (await response.json()) as { operationId: string };
		await waitForOperation(result.operationId);
		return true;
	} catch (error) {
		showMessage(
			error instanceof Error ? error.message : String(error),
			"error"
		);
		return false;
	} finally {
		busy.value = false;
	}
}

async function saveGeneral(): Promise<void> {
	normalizeAccess();
	const saved = await request(`${basePath}/operations/settings/general`, {
		siteName: siteName.value,
		metadataCallback: metadataCallback.value,
		access: { ...access }
	});
	if (saved) await loadState("general");
}

async function saveExtensions(): Promise<void> {
	const saved = await request(`${basePath}/operations/settings/extensions`, {
		extensions: Object.fromEntries(
			extensions.value.map((extension) => [extension.id, extension.enabled])
		)
	});
	if (saved) await loadState("extensions");
}

async function saveWikimediaLogin(): Promise<void> {
	const saved = await request(
		`${basePath}/operations/settings/wikimedia-login`,
		{
			consumerToken: wikimediaConsumerToken.value,
			secretToken: wikimediaSecretToken.value
		}
	);
	if (saved) await loadState("wikimedia-login");
}

async function runAction(action: "restart" | "update"): Promise<void> {
	await request(`${basePath}/operations/actions/${action}`);
}

onMounted(checkAuthorization);
</script>
