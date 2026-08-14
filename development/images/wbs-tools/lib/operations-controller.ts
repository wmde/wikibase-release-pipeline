import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	renameSync,
	rmSync,
	writeFileSync
} from 'node:fs';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { BUNDLED_EXTENSIONS } from './bundled-extensions.js';
import { captureProcess, runProcess } from './command-runner.js';
import { composeArgs, installedSuiteExists } from './compose.js';
import { parseEnvContent, serializeEnvContent } from './validation.js';

export type OperationsAction = 'apply' | 'restart' | 'update';

type OperationsRequest = {
	id: string;
	action: OperationsAction;
	settings?: OperationsSettings;
};

type AccessSettings = {
	publicRead: boolean;
	accountRegistration: boolean;
	anonymousEditing: boolean;
	anonymousItemCreation: boolean;
	anonymousPropertyCreation: boolean;
	uploads: boolean;
};

type InstanceSettings = { siteName: string; access: AccessSettings };
type OperationsSettings =
	| {
			scope: 'general';
			siteName: string;
			metadataCallback: boolean;
			access: AccessSettings;
	  }
	| {
			scope: 'extensions';
			extensions: Record<string, boolean>;
	  }
	| {
			scope: 'wikimedia-login';
			wikimediaLogin: { consumerToken: string; secretToken: string };
	  };

const repositoryRoot = process.env.WBS_DIR || '/app/wbs';
const stateRoot = process.env.WBS_STATE_DIR || join(repositoryRoot, '.wbs');
const operationsRoot =
	process.env.WBS_OPERATIONS_DIR || join(stateRoot, 'operations');
const envPath = join(repositoryRoot, '.env');
const extensionStatePath = join(repositoryRoot, 'config', 'WBSExtensions.json');
const instanceSettingsPath = join(repositoryRoot, 'config', 'WBSConfig.json');
const defaultAccess: AccessSettings = {
	publicRead: true,
	accountRegistration: false,
	anonymousEditing: false,
	anonymousItemCreation: false,
	anonymousPropertyCreation: false,
	uploads: true
};

function atomicWrite(path: string, contents: string): void {
	const temporary = `${path}.tmp`;
	writeFileSync(temporary, contents);
	renameSync(temporary, path);
}

function extensionOverrides(): Record<string, boolean> {
	if (!existsSync(extensionStatePath)) {
		return {};
	}
	const state = JSON.parse(readFileSync(extensionStatePath, 'utf8')) as unknown;
	const overrides =
		state && typeof state === 'object'
			? (state as Record<string, boolean>)
			: {};
	if (overrides['VisualEditor.php'] === false) {
		overrides['DiscussionTools.php'] = false;
	}
	return overrides;
}

function currentInstanceSettings(): InstanceSettings {
	if (existsSync(instanceSettingsPath)) {
		const settings = JSON.parse(
			readFileSync(instanceSettingsPath, 'utf8')
		) as InstanceSettings;
		return {
			siteName: settings.siteName,
			access: { ...defaultAccess, ...settings.access }
		};
	}
	const generatedSettings = readFileSync(
		join(repositoryRoot, 'config', 'InstanceSettings.php'),
		'utf8'
	);
	const siteName = generatedSettings.match(
		/\$wgSitename\s*=\s*'([^']*)'/u
	)?.[1];
	return { siteName: siteName || 'Wikibase', access: { ...defaultAccess } };
}

function writeOperationsState(): void {
	const env = parseEnvContent(readFileSync(envPath, 'utf8'));
	const overrides = extensionOverrides();
	const instanceSettings = currentInstanceSettings();
	atomicWrite(
		join(operationsRoot, 'state.json'),
		JSON.stringify({
			...instanceSettings,
			metadataCallback: String(env.METADATA_CALLBACK).toLowerCase() !== 'false',
			wikimediaLogin: {
				consumerToken: env.WIKIMEDIA_OAUTH_CONSUMER_TOKEN || '',
				secretConfigured: Boolean(env.WIKIMEDIA_OAUTH_SECRET_TOKEN)
			},
			extensions: BUNDLED_EXTENSIONS.map((extension) => ({
				...extension,
				enabled: overrides[extension.id] ?? extension.defaultEnabled
			}))
		})
	);
}

function applySettings(request: OperationsRequest): boolean {
	if (!request.settings) {
		throw new Error('Configuration settings are missing.');
	}
	const env = parseEnvContent(readFileSync(envPath, 'utf8'));

	if (request.settings.scope === 'general') {
		const { siteName, metadataCallback, access } = request.settings;
		if (
			typeof siteName !== 'string' ||
			!siteName ||
			typeof metadataCallback !== 'boolean' ||
			!access ||
			Object.values(access).some((value) => typeof value !== 'boolean')
		) {
			throw new Error('General settings are invalid.');
		}
		if (
			(access.anonymousItemCreation && !access.anonymousEditing) ||
			(access.anonymousPropertyCreation && !access.anonymousItemCreation)
		) {
			throw new Error(
				'Anonymous creation requires the preceding editing permissions.'
			);
		}
		const metadataChanged =
			(String(env.METADATA_CALLBACK).toLowerCase() !== 'false') !==
			metadataCallback;
		atomicWrite(
			instanceSettingsPath,
			`${JSON.stringify({ siteName, access }, null, 2)}\n`
		);
		env.METADATA_CALLBACK = String(metadataCallback);
		atomicWrite(envPath, serializeEnvContent(env));
		return metadataChanged;
	}

	if (request.settings.scope === 'extensions') {
		const knownIds = new Set(
			BUNDLED_EXTENSIONS.map((extension) => extension.id)
		);
		const extensionSettings = request.settings.extensions;
		if (
			!extensionSettings ||
			typeof extensionSettings !== 'object' ||
			Object.entries(extensionSettings).some(
				([id, enabled]) => !knownIds.has(id) || typeof enabled !== 'boolean'
			)
		) {
			throw new Error('Extension settings are invalid.');
		}
		const previousOverrides = extensionOverrides();
		const extensionsChanged = BUNDLED_EXTENSIONS.some(
			(extension) =>
				(previousOverrides[extension.id] ?? extension.defaultEnabled) !==
				(extensionSettings[extension.id] ?? extension.defaultEnabled)
		);
		if (extensionSettings['VisualEditor.php'] === false) {
			extensionSettings['DiscussionTools.php'] = false;
		}
		atomicWrite(
			extensionStatePath,
			`${JSON.stringify(extensionSettings, null, 2)}\n`
		);
		return extensionsChanged;
	}

	const previousConsumerToken = env.WIKIMEDIA_OAUTH_CONSUMER_TOKEN || '';
	const previousSecretToken = env.WIKIMEDIA_OAUTH_SECRET_TOKEN || '';
	const consumerToken = request.settings.wikimediaLogin.consumerToken;
	let secretToken = request.settings.wikimediaLogin.secretToken;
	if (consumerToken && !secretToken) {
		if (consumerToken !== previousConsumerToken || !previousSecretToken) {
			throw new Error(
				'Enter the secret token for this Wikimedia OAuth consumer.'
			);
		}
		secretToken = previousSecretToken;
	}
	if (!consumerToken) secretToken = '';
	const wikimediaLoginChanged =
		consumerToken !== previousConsumerToken ||
		secretToken !== previousSecretToken;
	env.WIKIMEDIA_OAUTH_CONSUMER_TOKEN = consumerToken;
	env.WIKIMEDIA_OAUTH_SECRET_TOKEN = secretToken;
	atomicWrite(envPath, serializeEnvContent(env));
	return wikimediaLoginChanged;
}

async function performAction(
	action: OperationsAction,
	recreateForApply = true
): Promise<void> {
	const args = composeArgs();
	if (action === 'apply') {
		if (!recreateForApply) {
			return;
		}
		await runProcess('docker', [
			...args,
			'up',
			'--detach',
			'--wait',
			'--force-recreate',
			'--no-deps',
			'wikibase',
			'wikibase-jobrunner'
		]);
		return;
	}
	const configuredServices = await captureProcess('docker', [
		...args,
		'config',
		'--services'
	]);
	if (configuredServices.exitCode !== 0) {
		throw new Error(
			configuredServices.stderr || 'Could not read Compose services.'
		);
	}
	const services = configuredServices.stdout
		.split(/\s+/u)
		.filter(
			(service) =>
				service && service !== 'wbs-tools' && service !== 'wbs-tools-controller'
		);
	if (action === 'restart') {
		await runProcess('docker', [...args, 'restart', ...services]);
		return;
	}
	await runProcess('docker', [...args, 'pull', ...services]);
	await runProcess('docker', [
		...args,
		'up',
		'--detach',
		'--wait',
		...services
	]);
}

async function processRequest(requestPath: string): Promise<void> {
	const runningPath = requestPath.replace(/\.request\.json$/u, '.running.json');
	renameSync(requestPath, runningPath);
	let request: OperationsRequest | undefined;
	try {
		request = JSON.parse(
			readFileSync(runningPath, 'utf8')
		) as OperationsRequest;
		if (!request || !['apply', 'restart', 'update'].includes(request.action)) {
			throw new Error(`Unsupported operation: ${request?.action ?? 'missing'}`);
		}
		let recreated = false;
		if (request.action === 'apply') {
			recreated = applySettings(request);
			writeOperationsState();
		}
		await performAction(request.action, recreated);
		writeFileSync(
			join(operationsRoot, `${request.id}.result.json`),
			JSON.stringify({
				id: request.id,
				action: request.action,
				status: 'complete',
				message:
					request.action === 'update'
						? 'Images updated and services started.'
						: request.action === 'restart'
							? 'Services restarted.'
							: recreated
								? 'Configuration saved and Wikibase services restarted.'
								: 'Configuration saved.'
			})
		);
	} catch (error) {
		const id =
			request?.id || runningPath.split('/').at(-1)?.split('.')[0] || 'unknown';
		writeFileSync(
			join(operationsRoot, `${id}.result.json`),
			JSON.stringify({
				id,
				status: 'failed',
				message: error instanceof Error ? error.message : String(error)
			})
		);
	} finally {
		rmSync(runningPath, { force: true });
	}
}

export async function runOperationsController(): Promise<void> {
	if (
		!(await installedSuiteExists()) ||
		!existsSync(join(repositoryRoot, '.env'))
	) {
		throw new Error('No configured Wikibase Suite instance was found.');
	}
	mkdirSync(operationsRoot, { recursive: true });
	for (const file of readdirSync(operationsRoot)) {
		if (file.endsWith('.running.json')) {
			renameSync(
				join(operationsRoot, file),
				join(operationsRoot, file.replace('.running.json', '.request.json'))
			);
		}
	}
	writeOperationsState();
	let stopping = false;
	const stop = (): void => {
		stopping = true;
	};
	process.once('SIGINT', stop);
	process.once('SIGTERM', stop);
	while (!stopping) {
		try {
			for (const file of readdirSync(operationsRoot).filter((name) =>
				name.endsWith('.request.json')
			)) {
				await processRequest(join(operationsRoot, file));
			}
		} catch (error) {
			console.error(error);
		}
		await delay(400);
	}
}
