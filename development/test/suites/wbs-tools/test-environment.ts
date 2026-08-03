import { spawnSync } from 'child_process';
import {
	copyFileSync,
	cpSync,
	existsSync,
	mkdirSync,
	readFileSync,
	rmSync,
	writeFileSync
} from 'fs';
import { join, resolve } from 'path';

export const INSTALLER_PORT = 18888;
export const WIKIBASE_HTTPS_PORT = 18443;
export const INSTALLER_URL = `https://host.docker.internal:${ INSTALLER_PORT }`;
export const WIKIBASE_URL = 'https://wikibase.test';
export const ADMIN_USERNAME = 'WbsToolsAdmin';
export const ADMIN_PASSWORD = 'WbsToolsAdminPassword-2026';
export const ADMIN_EMAIL = 'wbs-tools-test@example.org';
export const INSTALL_TIMEOUT = 15 * 60 * 1000;

const INSTALLER_CONTAINER = 'wbs-tools-e2e-installer';
const INSTALL_PROJECT = 'wbs-tools-e2e';
const HOST_REPOSITORY_ROOT = resolve(
	process.env.HOST_PWD || join( process.cwd(), '../..' )
);
const SUITE_ROOT = join(
	HOST_REPOSITORY_ROOT,
	'development/test/suites/wbs-tools'
);
const TEMP_ROOT = join( SUITE_ROOT, 'tmp' );
const CHECKOUT_ROOT = join( TEMP_ROOT, 'checkout' );
const RESULT_ROOT = join( SUITE_ROOT, 'results' );
const INSTALL_LOG = join( CHECKOUT_ROOT, 'installation.log' );
const COMPOSE_FILES = [
	join( CHECKOUT_ROOT, 'docker-compose.yml' ),
	join( CHECKOUT_ROOT, 'docker-compose.local.yml' )
];

type CommandOptions = {
	cwd?: string;
	env?: NodeJS.ProcessEnv;
	allowFailure?: boolean;
};

function run(
	command: string,
	args: string[],
	options: CommandOptions = {}
): string {
	const result = spawnSync( command, args, {
		cwd: options.cwd,
		env: options.env || process.env,
		encoding: 'utf8',
		stdio: 'pipe'
	} );
	const output = `${ result.stdout || '' }${ result.stderr || '' }`;

	if ( result.error && !options.allowFailure ) {
		throw result.error;
	}
	if ( result.status !== 0 && !options.allowFailure ) {
		throw new Error(
			`Command failed (${ command } ${ args.join( ' ' ) }):\n${ output }`
		);
	}

	return output;
}

function composeArgs( command: string[] ): string[] {
	return [
		'compose',
		'-p',
		INSTALL_PROJECT,
		'-f',
		COMPOSE_FILES[ 0 ],
		'-f',
		COMPOSE_FILES[ 1 ],
		...command
	];
}

function copyCheckout(): void {
	rmSync( TEMP_ROOT, { recursive: true, force: true } );
	mkdirSync( CHECKOUT_ROOT, { recursive: true } );
	mkdirSync( join( CHECKOUT_ROOT, '.git' ) );
	mkdirSync( join( CHECKOUT_ROOT, 'config/extensions' ), { recursive: true } );

	for ( const file of [
		'install',
		'wbs',
		'docker-compose.yml',
		'.env.example',
		'package.json'
	] ) {
		copyFileSync( join( HOST_REPOSITORY_ROOT, file ), join( CHECKOUT_ROOT, file ) );
	}
	for ( const file of [ 'Extensions.php', 'traefik-dynamic.yml' ] ) {
		copyFileSync(
			join( HOST_REPOSITORY_ROOT, 'config', file ),
			join( CHECKOUT_ROOT, 'config', file )
		);
	}
	cpSync( join( HOST_REPOSITORY_ROOT, 'tools' ), join( CHECKOUT_ROOT, 'tools' ), {
		recursive: true
	} );
	copyFileSync(
		join( SUITE_ROOT, 'docker-compose.install.yml' ),
		join( CHECKOUT_ROOT, 'docker-compose.local.yml' )
	);
	writeFileSync( INSTALL_LOG, '' );
}

function toolsImage(): string {
	const registry = process.env.WBS_TEST_IMAGE_REGISTRY || 'wikibase';
	const tag = process.env.WBS_TEST_IMAGE_TAG || 'latest';
	return `${ registry }/wbs-tools:${ tag }`;
}

export function verifyCliArtifact(): void {
	run( 'docker', [
		'run',
		'--rm',
		'--entrypoint',
		'sh',
		toolsImage(),
		'-c',
		'test -f dist/wbs.js && test -f dist/cli.js'
	] );
}

export function verifyCommandInterface(): void {
	const image = toolsImage();
	const help = run( 'docker', [
		'run',
		'--rm',
		image,
		'node',
		'dist/wbs.js',
		'install',
		'--help'
	] );
	for ( const option of [ '--web', '--local', '--dev', '--build', '--debug' ] ) {
		if ( !help.includes( option ) ) {
			throw new Error( `wbs install help does not include ${ option }.` );
		}
	}
	if ( help.includes( '--cli' ) ) {
		throw new Error( 'wbs install must not expose the redundant --cli option.' );
	}

	for ( const invalidOption of [ '--cli', '--unknown-option' ] ) {
		const result = spawnSync(
			'docker',
			[
				'run',
				'--rm',
				'-e',
				'WBS_VALIDATE_OPTIONS=true',
				image,
				'node',
				'dist/wbs.js',
				'install',
				invalidOption
			],
			{ encoding: 'utf8', stdio: 'pipe' }
		);
		if ( result.status === 0 ) {
			throw new Error( `wbs install unexpectedly accepted ${ invalidOption }.` );
		}
	}
}

export function runBootstrapTest(): void {
	run( 'bash', [
		join(
			HOST_REPOSITORY_ROOT,
			'development/test/suites/wbs-tools/specs/install-bootstrap.sh'
		)
	] );
}

export function startInstaller(): void {
	copyCheckout();
	const image = toolsImage();
	const skipPull = process.env.GITHUB_ACTIONS === 'true' ? 'false' : 'true';

	run( 'bash', [ './install', '--local' ], {
		cwd: CHECKOUT_ROOT,
		env: {
			...process.env,
			COMPOSE_PROJECT_NAME: INSTALL_PROJECT,
			LOG_PATH: INSTALL_LOG,
			WBS_E2E_PULL_POLICY:
				process.env.GITHUB_ACTIONS === 'true' ? 'always' : 'never',
			WBS_E2E_HTTP_PORT: '18080',
			WBS_E2E_HTTPS_PORT: String( WIKIBASE_HTTPS_PORT ),
			WBS_INSTALLER_CONTAINER_NAME: INSTALLER_CONTAINER,
			WBS_INSTALLER_PORT: String( INSTALLER_PORT ),
			WBS_SKIP_ARCH_CHECK: 'true',
			WBS_SKIP_DEPENDENCY_INSTALLS: 'true',
			WBS_TOOLS_IMAGE: image,
			WBS_TOOLS_SKIP_PULL: skipPull
		}
	} );
}

function wait( milliseconds: number ): Promise<void> {
	return new Promise( ( resolveWait ) => {
		setTimeout( resolveWait, milliseconds );
	} );
}

function installedServicesHealthProblem(): string | undefined {
	const expected = run( 'docker', composeArgs( [ 'config', '--services' ] ), {
		cwd: CHECKOUT_ROOT
	} )
		.trim()
		.split( /\s+/ )
		.filter( Boolean );
	const running = new Set(
		run( 'docker', composeArgs( [ 'ps', '--services', '--status', 'running' ] ), {
			cwd: CHECKOUT_ROOT
		} )
			.trim()
			.split( /\s+/ )
			.filter( Boolean )
	);
	const notRunning = expected.filter( ( service ) => !running.has( service ) );
	if ( notRunning.length > 0 ) {
		return `Services not running: ${ notRunning.join( ', ' ) }`;
	}

	const ids = run( 'docker', composeArgs( [ 'ps', '-q' ] ), {
		cwd: CHECKOUT_ROOT
	} )
		.trim()
		.split( /\s+/ )
		.filter( Boolean );
	if ( ids.length === 0 ) {
		return 'No installed containers were found.';
	}
	const inspected = JSON.parse( run( 'docker', [ 'inspect', ...ids ] ) ) as {
		Name: string;
		State: { Status: string; Health?: { Status: string } };
	}[];
	const unhealthy = inspected.filter(
		( container ) =>
			container.State.Status !== 'running' ||
			( container.State.Health !== undefined &&
				container.State.Health.Status !== 'healthy' )
	);
	if ( unhealthy.length > 0 ) {
		return `Containers not healthy: ${ unhealthy
			.map(
				( container ) =>
					`${ container.Name } (${
						container.State.Health ?
							container.State.Health.Status :
							container.State.Status
					})`
			)
			.join( ', ' ) }`;
	}
	return undefined;
}

export async function waitForInstalledServicesHealthy(): Promise<void> {
	const deadline = Date.now() + INSTALL_TIMEOUT;
	let problem = 'The installed services have not started.';
	while ( Date.now() < deadline ) {
		problem = installedServicesHealthProblem() || '';
		if ( !problem ) {
			return;
		}
		await wait( 5000 );
	}
	throw new Error( `Installed services did not become healthy: ${ problem }` );
}

export function collectDiagnostics(): void {
	mkdirSync( RESULT_ROOT, { recursive: true } );
	if ( existsSync( INSTALL_LOG ) ) {
		writeFileSync(
			join( RESULT_ROOT, 'installation.log' ),
			readFileSync( INSTALL_LOG )
		);
	}
	writeFileSync(
		join( RESULT_ROOT, 'installer-container.log' ),
		run( 'docker', [ 'logs', INSTALLER_CONTAINER ], { allowFailure: true } )
	);
	if ( existsSync( COMPOSE_FILES[ 0 ] ) ) {
		writeFileSync(
			join( RESULT_ROOT, 'installed-services.log' ),
			run( 'docker', composeArgs( [ 'logs', '--no-color' ] ), {
				cwd: CHECKOUT_ROOT,
				allowFailure: true
			} )
		);
	}
}

export function stopInstaller(): void {
	run( 'docker', [ 'rm', '-f', INSTALLER_CONTAINER ], { allowFailure: true } );
	if ( existsSync( COMPOSE_FILES[ 0 ] ) ) {
		run(
			'docker',
			composeArgs( [ 'down', '--volumes', '--remove-orphans', '--timeout', '1' ] ),
			{ cwd: CHECKOUT_ROOT, allowFailure: true }
		);
	}
	rmSync( TEMP_ROOT, { recursive: true, force: true } );
}
