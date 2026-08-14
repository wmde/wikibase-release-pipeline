import express, {
	type NextFunction,
	type Request,
	type Response,
	type Router
} from 'express';
import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { BUNDLED_EXTENSIONS } from '../../lib/bundled-extensions.js';

type OperationsAction = 'apply' | 'restart' | 'update';
type GeneralSettings = {
	scope: 'general';
	siteName: string;
	metadataCallback: boolean;
	access: Record<string, boolean>;
};
type ExtensionSettings = {
	scope: 'extensions';
	extensions: Record<string, boolean>;
};
type WikimediaLoginSettings = {
	scope: 'wikimedia-login';
	wikimediaLogin: { consumerToken: string; secretToken: string };
};
type OperationsSettings =
	| GeneralSettings
	| ExtensionSettings
	| WikimediaLoginSettings;
const operationIdPattern =
	/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u;
const operationsRoot =
	process.env.WBS_OPERATIONS_DIR || '/app/state/operations';
const statePath = join(operationsRoot, 'state.json');
const wikibaseInternalUrl =
	process.env.WIKIBASE_INTERNAL_URL || 'http://wikibase';
const wikibasePublicUrl = (process.env.WIKIBASE_PUBLIC_URL || '').replace(
	/\/$/u,
	''
);

type AuthorizedUser = { name: string };

async function authorizedUser(req: Request): Promise<AuthorizedUser | null> {
	const response = await fetch(
		`${wikibaseInternalUrl}/w/api.php?${new URLSearchParams({
			action: 'query',
			meta: 'userinfo',
			uiprop: 'rights',
			format: 'json',
			formatversion: '2'
		})}`,
		{
			headers: req.headers.cookie ? { cookie: req.headers.cookie } : {}
		}
	);
	if (!response.ok) {
		throw new Error(`MediaWiki session check failed (${response.status}).`);
	}
	const result = (await response.json()) as {
		query?: { userinfo?: { anon?: boolean; name?: string; rights?: string[] } };
	};
	const user = result.query?.userinfo;
	if (
		!user ||
		user.anon === true ||
		!user.name ||
		!user.rights?.includes('wbs-manage-instance')
	) {
		return null;
	}
	return { name: user.name };
}

async function requireAuthorization(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		if (!(await authorizedUser(req))) {
			res
				.status(401)
				.json({ message: 'Wikibase administrator sign-in required.' });
			return;
		}
		next();
	} catch (error) {
		res.status(503).json({
			message: error instanceof Error ? error.message : String(error)
		});
	}
}

function requireSameOrigin(
	req: Request,
	res: Response,
	next: NextFunction
): void {
	if (!wikibasePublicUrl || req.get('origin') !== wikibasePublicUrl) {
		res.status(403).json({ message: 'Invalid request origin.' });
		return;
	}
	next();
}

function operationRequest(
	action: OperationsAction,
	settings?: OperationsSettings
): string {
	const id = randomUUID();
	writeFileSync(
		join(operationsRoot, `${id}.request.json`),
		JSON.stringify({ id, action, settings })
	);
	return id;
}

const accessKeys = [
	'publicRead',
	'accountRegistration',
	'anonymousEditing',
	'anonymousItemCreation',
	'anonymousPropertyCreation',
	'uploads'
];

function validAccessSettings(value: unknown): value is Record<string, boolean> {
	if (!value || typeof value !== 'object') return false;
	const access = value as Record<string, unknown>;
	return (
		!Object.keys(access).some((key) => !accessKeys.includes(key)) &&
		!accessKeys.some((key) => typeof access[key] !== 'boolean') &&
		!(access.anonymousItemCreation && !access.anonymousEditing) &&
		!(access.anonymousPropertyCreation && !access.anonymousItemCreation)
	);
}

function validatedExtensions(
	value: unknown
): Record<string, boolean> | undefined {
	if (!value || typeof value !== 'object') return undefined;
	const knownIds = new Set(BUNDLED_EXTENSIONS.map((extension) => extension.id));
	const extensions: Record<string, boolean> = {};
	for (const [id, enabled] of Object.entries(value)) {
		if (!knownIds.has(id) || typeof enabled !== 'boolean') return undefined;
		extensions[id] = enabled;
	}
	return extensions;
}

export function createOperationsRouter(): Router {
	const router = express.Router();
	router.get('/auth/state', async (req, res) => {
		try {
			const user = await authorizedUser(req);
			res.json({
				authenticated: user !== null,
				userName: user?.name,
				loginUrl: `${wikibasePublicUrl}/wiki/Special:UserLogin`,
				wikibaseUrl: wikibasePublicUrl
			});
		} catch (error) {
			res.status(503).json({
				authenticated: false,
				loginUrl: `${wikibasePublicUrl}/wiki/Special:UserLogin`,
				message: error instanceof Error ? error.message : String(error)
			});
		}
	});
	router.use(requireAuthorization);
	router.use((req, res, next) => {
		if (req.method === 'POST') {
			requireSameOrigin(req, res, next);
			return;
		}
		next();
	});
	router.get('/state', (_req, res) => {
		try {
			res.type('json').send(readFileSync(statePath, 'utf8'));
		} catch (error) {
			res.status(500).json({
				message: error instanceof Error ? error.message : String(error)
			});
		}
	});
	router.post('/settings/general', (req, res) => {
		try {
			if (
				typeof req.body?.siteName !== 'string' ||
				req.body.siteName.trim().length === 0 ||
				req.body.siteName.trim().length > 255 ||
				typeof req.body?.metadataCallback !== 'boolean' ||
				!validAccessSettings(req.body?.access)
			) {
				res.status(400).json({ message: 'Invalid general settings.' });
				return;
			}
			res.status(202).json({
				operationId: operationRequest('apply', {
					scope: 'general',
					siteName: req.body.siteName.trim(),
					metadataCallback: req.body.metadataCallback,
					access: Object.fromEntries(
						accessKeys.map((key) => [key, req.body.access[key]])
					)
				})
			});
		} catch (error) {
			res.status(500).json({
				message: error instanceof Error ? error.message : String(error)
			});
		}
	});
	router.post('/settings/extensions', (req, res) => {
		const extensions = validatedExtensions(req.body?.extensions);
		if (!extensions) {
			res.status(400).json({ message: 'Invalid extension settings.' });
			return;
		}
		res.status(202).json({
			operationId: operationRequest('apply', {
				scope: 'extensions',
				extensions
			})
		});
	});
	router.post('/settings/wikimedia-login', (req, res) => {
		if (
			typeof req.body?.consumerToken !== 'string' ||
			typeof req.body?.secretToken !== 'string'
		) {
			res.status(400).json({ message: 'Invalid Wikimedia login settings.' });
			return;
		}
		res.status(202).json({
			operationId: operationRequest('apply', {
				scope: 'wikimedia-login',
				wikimediaLogin: {
					consumerToken: req.body.consumerToken.trim(),
					secretToken: req.body.secretToken.trim()
				}
			})
		});
	});
	router.post('/actions/:action', (req, res) => {
		const action = req.params.action as OperationsAction;
		if (!['restart', 'update'].includes(action)) {
			res.status(404).json({ message: 'Unknown operation.' });
			return;
		}
		res.status(202).json({ operationId: operationRequest(action) });
	});
	router.get('/operations/:id', (req, res) => {
		if (!operationIdPattern.test(req.params.id)) {
			res.status(400).json({ message: 'Invalid operation ID.' });
			return;
		}
		const resultPath = join(operationsRoot, `${req.params.id}.result.json`);
		if (!existsSync(resultPath)) {
			res.json({ id: req.params.id, status: 'running' });
			return;
		}
		res.type('json').send(readFileSync(resultPath, 'utf8'));
	});
	return router;
}
