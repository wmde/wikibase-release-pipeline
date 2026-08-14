import express from 'express';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createOperationsRouter } from './routes/operations.js';

const moduleDir = dirname(fileURLToPath(import.meta.url));
const appRoot = join(dirname(dirname(moduleDir)), 'web');
const publicBasePath = (process.env.PUBLIC_BASE_PATH || '').replace(/\/$/u, '');

function renderShell(): string {
	return readFileSync(join(appRoot, 'index.html'), 'utf8')
		.replace('%PAGE_TITLE%', 'Configure Wikibase Suite')
		.replace('%PUBLIC_BASE_PATH%', publicBasePath)
		.replace(
			'%BUILT_STYLE_LINK%',
			`<link rel="stylesheet" href="${publicBasePath}/assets/installer-app.css" />`
		)
		.replace(
			'%INSTALLER_STATE%',
			JSON.stringify({ operationsPanel: true, basePath: publicBasePath })
		)
		.replace(
			'%SCRIPT_SRC%',
			`${publicBasePath}/assets/installer-app.js`
		);
}

const app = express();
app.use((_req, res, next) => {
	res.setHeader('Cache-Control', 'no-store');
	res.setHeader('Referrer-Policy', 'no-referrer');
	next();
});
app.use(express.static(join(appRoot, 'public')));
app.use(express.json());
app.use('/operations', createOperationsRouter());
app.get('/', (_req, res) => res.type('html').send(renderShell()));

createServer(app).listen(80);
