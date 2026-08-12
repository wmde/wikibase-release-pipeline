import { randomBytes, randomInt } from 'node:crypto';
import {
	copyFileSync,
	existsSync,
	mkdirSync,
	rmSync,
	writeFileSync
} from 'node:fs';
import { join } from 'node:path';
import { captureProcess, runProcess } from './command-runner.js';
import { composeServicesAreRunning, installedSuiteExists } from './compose.js';
import {
	classifyExistingInstallState,
	inspectInstallationAttempt,
	type ExistingInstallState
} from './installation-state.js';
import {
	installerWebContainer,
	installerWorkerContainer,
	stopInstallerSession
} from './installer-session.js';
import { resolveServerIp } from './server-ip.js';

export type WebInstallerOptions = {
	configurationOnly: boolean;
	local: boolean;
	debug: boolean;
	build: boolean;
};

const repositoryRoot = process.env.WBS_DIR || '/app/wbs';
const stateRoot = process.env.WBS_STATE_DIR || join( repositoryRoot, '.wbs' );
const envFile = process.env.ENV_FILE_PATH || join( repositoryRoot, '.env' );
const wbsLog = process.env.WBS_LOG_PATH || join( stateRoot, 'logs/wbs.log' );
const installationLog = process.env.INSTALLATION_LOG_PATH ||
	join( stateRoot, 'logs/installation.log' );
const triggerPath = process.env.LAUNCH_TRIGGER_PATH || join( stateRoot, 'install-request' );
const triggerContainerPath = '/app/state/install-request';
const certificateRoot = join( stateRoot, 'certs' );
const letsEncryptRoot = join( stateRoot, 'letsencrypt' );
const toolsImage = process.env.WBS_TOOLS_IMAGE || 'wikibase/wbs-tools:latest';
const installerPort = process.env.WBS_INSTALLER_PORT || '8888';

function accessCode(): string {
	const configured = process.env.WBS_INSTALLER_ACCESS_CODE;
	const value = configured || String( randomInt( 1_000_000 ) ).padStart( 6, '0' );
	if ( !/^\d{6}$/.test( value ) ) {
		throw new Error( 'WBS_INSTALLER_ACCESS_CODE must contain exactly six digits.' );
	}
	return value;
}

async function provisionCertificate(
	host: string,
	local: boolean,
	debug: boolean
): Promise<boolean> {
	mkdirSync( letsEncryptRoot, { recursive: true } );
	mkdirSync( certificateRoot, { recursive: true } );
	if ( !local ) {
		const result = await captureProcess( 'docker', [
			'run', '--rm',
			'-v', `${ letsEncryptRoot }:/etc/letsencrypt`,
			'-v', `${ certificateRoot }:/certs`,
			'-p', '80:80',
			process.env.CERTBOT_IMAGE || 'certbot/certbot:v4.2.0',
			'certonly', '--standalone', '--non-interactive',
			'--preferred-challenges', 'http', '--agree-tos',
			'--email', process.env.CERT_EMAIL || 'wbs-setup@wikimedia.de',
			'-d', host
		], { logOutput: true } );
		if ( result.exitCode === 0 ) {
			const liveRoot = join( letsEncryptRoot, 'live', host );
			const fullchain = join( liveRoot, 'fullchain.pem' );
			const privateKey = join( liveRoot, 'privkey.pem' );
			if ( existsSync( fullchain ) && existsSync( privateKey ) ) {
				copyFileSync( fullchain, join( certificateRoot, 'cert.pem' ) );
				copyFileSync( privateKey, join( certificateRoot, 'key.pem' ) );
				return false;
			}
		}
	}
	await runProcess( 'openssl', [
		'req', '-x509', '-nodes', '-days', '365', '-newkey', 'rsa:2048',
		'-out', join( certificateRoot, 'cert.pem' ),
		'-keyout', join( certificateRoot, 'key.pem' ),
		'-subj', `/CN=${ host }`
	], { quiet: !debug } );
	return true;
}

async function existingInstallState( localImages: boolean ): Promise<ExistingInstallState> {
	const lastAttemptFailed = inspectInstallationAttempt( installationLog ).failed;
	const servicesRunning = !lastAttemptFailed && await composeServicesAreRunning( localImages );
	const persistentInstallExists = !lastAttemptFailed &&
		( servicesRunning || await installedSuiteExists( localImages ) );
	return classifyExistingInstallState( {
		lastAttemptFailed,
		servicesRunning,
		installedSuiteExists: persistentInstallExists
	} );
}

function sharedWorkerArgs(): string[] {
	const passthrough = ( process.env.WBS_TOOLS_ENV_PASSTHROUGH || '' )
		.split( /\s+/ ).filter( Boolean );
	const environment = [
		'COMPOSE_PROJECT_NAME', 'BUILD_CACHE_REGISTRY', 'GITHUB_ACTIONS',
		'SERVER_IP', 'WBS_DEV_IMAGE', ...passthrough
	];
	const args = [ '--rm' ];
	for ( const name of environment ) {
		if ( process.env[ name ] !== undefined ) {
			args.push( '-e', `${ name }=${ process.env[ name ] }` );
		}
	}
	args.push(
		'-e', `WBS_DIR=${ repositoryRoot }`,
		'-e', `ENV_FILE_PATH=${ envFile }`,
		'-e', `WBS_LOG_PATH=${ wbsLog }`,
		'-e', `INSTALLATION_LOG_PATH=${ installationLog }`,
		'-v', '/var/run/docker.sock:/var/run/docker.sock',
		'-v', `${ repositoryRoot }:${ repositoryRoot }`,
		'-w', repositoryRoot
	);
	return args;
}

async function startWorker( build: boolean, debug: boolean ): Promise<void> {
	const roleArgs = [ 'install', 'worker' ];
	if ( build || process.env.WBS_BUILD_IMAGES === 'true' ) {
		roleArgs.push( '--build' );
	} else if ( process.env.WBS_LOCAL_IMAGES === 'true' ) {
		roleArgs.push( '--local-images' );
	}
	await runProcess( 'docker', [
		'run', '-d', '--name', installerWorkerContainer, '--network', 'none',
		'-e', `LAUNCH_TRIGGER_PATH=${ triggerPath }`,
		...sharedWorkerArgs(), toolsImage,
		'node', '/app/dist/wbs.js', ...roleArgs
	], { quiet: !debug } );
}

async function startDevelopmentServer(
	host: string,
	code: string,
	selfSigned: boolean,
	serverIp: string,
	installState: string,
	options: WebInstallerOptions
): Promise<void> {
	const mock = process.env.INSTALLER_DEV_MOCK === 'true';
	if ( !mock ) {
		await startWorker( options.build, options.debug );
	}
	showUrl( host, code, selfSigned );
	try {
		await runProcess( 'pnpm', [ '--filter', 'wbs-tools', 'dev:server' ], {
			cwd: process.env.WBS_DEVELOPMENT_ROOT,
			env: {
				...process.env,
				SERVER_IP: serverIp,
				EXISTING_INSTALL_STATE: installState,
				DEV_SERVER: 'true',
				INSTALLER_ACCESS_CODE: code,
				SSL_CERT_KEY_PATH: join( certificateRoot, 'key.pem' ),
				SSL_CERT_PATH: join( certificateRoot, 'cert.pem' )
			}
		} );
	} finally {
		await stopInstallerSession();
	}
}

function showUrl( host: string, code: string, selfSigned: boolean ): void {
	console.log( `Open the following URL in your browser to continue:\n\nhttps://${ host }:${ installerPort }/access/${ code }\n` );
	if ( selfSigned ) {
		console.log( [
			'⚠️ This installer page is using a temporary self-signed HTTPS certificate.',
			'Your browser will likely show a warning before loading the page.',
			`After bypassing the warning, if prompted for an access code, enter ${ code }.`,
			''
		].join( '\n' ) );
	}
}

export async function launchWebInstaller( options: WebInstallerOptions ): Promise<void> {
	const serverIp = await resolveServerIp( options.local );
	const host = options.local ? 'localhost' :
		`wbs-installer-${ randomBytes( 4 ).toString( 'hex' ) }.${ serverIp }.nip.io`;
	const code = accessCode();
	const installState = await existingInstallState(
		process.env.WBS_LOCAL_IMAGES === 'true' || options.build
	);
	console.log( '🔧 Launching web-based installer...' );
	console.log();
	const selfSigned = await provisionCertificate( host, options.local, options.debug );
	await stopInstallerSession();
	mkdirSync( join( stateRoot, 'logs' ), { recursive: true } );
	for ( const path of [ envFile, wbsLog ] ) {
		if ( !existsSync( path ) ) {
			writeFileSync( path, '' );
		}
	}
	rmSync( installationLog, { force: true } );
	rmSync( triggerPath, { force: true } );
	if ( process.env.INSTALLER_DEV === 'true' ) {
		await startDevelopmentServer(
			host, code, selfSigned, serverIp, installState, options
		);
		return;
	}

	await runProcess( 'docker', [
		'run', '-d', '--name', installerWebContainer,
		'-e', `SERVER_IP=${ serverIp }`,
		'-e', `LOCALHOST=${ options.local }`,
		'-e', `LAUNCH_TRIGGER_PATH=${ triggerContainerPath }`,
		'-e', `EXISTING_INSTALL_STATE=${ installState }`,
		'-e', `CONFIGURE_ONLY=${ options.configurationOnly }`,
		'-e', 'WBS_LOG_PATH=/app/state/logs/wbs.log',
		'-e', 'INSTALLATION_LOG_PATH=/app/state/logs/installation.log',
		'-e', `INSTALLER_ACCESS_CODE=${ code }`,
		'-e', `WBS_INSTALLER_URL=https://${ host }:${ installerPort }/access/${ code }`,
		'-p', `${ installerPort }:443`,
		'-v', `${ repositoryRoot }:/app/wbs:ro`,
		'-v', `${ envFile }:/app/wbs/.env`,
		'-v', `${ stateRoot }:/app/state`,
		'-v', `${ certificateRoot }:/app/certs`,
		toolsImage, 'node', 'dist/wbs.js', 'install', 'web-server'
	], { quiet: !options.debug } );
	showUrl( host, code, selfSigned );

	if ( options.configurationOnly ) {
		await runProcess( 'docker', [ 'wait', installerWebContainer ], { quiet: !options.debug } );
		await stopInstallerSession();
	} else {
		await startWorker( options.build, options.debug );
	}
}
