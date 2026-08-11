import { captureProcess } from './command-runner.js';

export const installerWebContainer = process.env.WBS_INSTALLER_CONTAINER_NAME ||
	'wikibase-suite-installer-webserver';
export const installerWorkerContainer = process.env.WBS_INSTALLER_WORKER_CONTAINER_NAME ||
	'wikibase-suite-installer-worker';

async function containerIsRunning( name: string ): Promise<boolean> {
	const result = await captureProcess( 'docker', [
		'inspect', '--format', '{{.State.Running}}', name
	] );
	return result.exitCode === 0 && result.stdout.trim() === 'true';
}

async function removeContainer( name: string ): Promise<void> {
	await captureProcess( 'docker', [ 'rm', '-fv', name ] );
}

export async function installerSessionIsRunning(): Promise<boolean> {
	const [ webRunning, workerRunning ] = await Promise.all( [
		containerIsRunning( installerWebContainer ),
		containerIsRunning( installerWorkerContainer )
	] );
	return webRunning || workerRunning;
}

export async function stopInstallerSession(): Promise<void> {
	await Promise.all( [
		removeContainer( installerWebContainer ),
		removeContainer( installerWorkerContainer )
	] );
}
