import { captureProcess } from './command-runner.js';

export const installerWebContainer = process.env.WBS_INSTALLER_CONTAINER_NAME ||
	'wikibase-suite-installer-webserver';
export const installerWorkerContainer = process.env.WBS_INSTALLER_WORKER_CONTAINER_NAME ||
	'wikibase-suite-installer-worker';
const installerLabel = 'org.wikibase-suite.installer';

export type InstallerSession = {
	kind: 'cli' | 'web';
	url?: string;
};

async function containerIsRunning( name: string ): Promise<boolean> {
	const result = await captureProcess( 'docker', [
		'inspect', '--format', '{{.State.Running}}', name
	] );
	return result.exitCode === 0 && result.stdout.trim() === 'true';
}

async function removeContainer( name: string ): Promise<void> {
	await captureProcess( 'docker', [ 'rm', '-fv', name ] );
}

async function labelledInstallerContainers(): Promise<Array<{ id: string; kind: 'cli' | 'web' }>> {
	const result = await captureProcess( 'docker', [
		'ps', '--filter', `label=${ installerLabel }`,
		'--format', `{{.ID}}\t{{.Label "${ installerLabel }"}}`
	] );
	if ( result.exitCode !== 0 ) {
		return [];
	}
	const currentContainer = process.env.HOSTNAME;
	return result.stdout.trim().split( '\n' )
		.filter( Boolean )
		.map( line => {
			const [ id, kind ] = line.split( '\t' );
			return { id, kind: kind === 'web' ? 'web' as const : 'cli' as const };
		} )
		.filter( container => container.id !== currentContainer );
}

async function webInstallerUrl(): Promise<string | undefined> {
	const result = await captureProcess( 'docker', [
		'inspect', '--format', '{{range .Config.Env}}{{println .}}{{end}}', installerWebContainer
	] );
	if ( result.exitCode !== 0 ) {
		return undefined;
	}
	const entry = result.stdout.split( '\n' ).find( line => line.startsWith( 'WBS_INSTALLER_URL=' ) );
	return entry?.slice( 'WBS_INSTALLER_URL='.length ) || undefined;
}

export async function activeInstallerSession(): Promise<InstallerSession | undefined> {
	const [ webRunning, workerRunning, labelledContainers ] = await Promise.all( [
		containerIsRunning( installerWebContainer ),
		containerIsRunning( installerWorkerContainer ),
		labelledInstallerContainers()
	] );
	if ( webRunning || workerRunning ) {
		return { kind: 'web', url: await webInstallerUrl() };
	}
	const labelledSession = labelledContainers[ 0 ];
	return labelledSession ? { kind: labelledSession.kind } : undefined;
}

export async function installerSessionIsRunning(): Promise<boolean> {
	return await activeInstallerSession() !== undefined;
}

export async function stopInstallerSession(): Promise<void> {
	const labelledContainers = await labelledInstallerContainers();
	await Promise.all( [
		removeContainer( installerWebContainer ),
		removeContainer( installerWorkerContainer ),
		...labelledContainers.map( container => removeContainer( container.id ) )
	] );
}
