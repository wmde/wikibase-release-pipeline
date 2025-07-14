/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { execAsync, execAsyncStream } from '../execAsync.js';

// Adjust this to your actual deploy path
const DEPLOY_DIR = '/opt/wbs/wikibase-release-pipeline/deploy';

export const getStatus = async () => {
	const { stdout } = await execAsync( 'docker compose ps --format json', {
		cwd: DEPLOY_DIR
	} );
	try {
		return JSON.parse( stdout );
	} catch ( err ) {
		throw new Error( 'Failed to parse docker compose status JSON' );
	}
};

export const startServices = async () => {
	const { stdout, stderr } = await execAsync( 'docker compose start', {
		cwd: DEPLOY_DIR
	} );
	return { stdout, stderr };
};

export const stopServices = async () => {
	const { stdout, stderr } = await execAsync( 'docker compose stop', {
		cwd: DEPLOY_DIR
	} );
	return { stdout, stderr };
};

export const resetServices = async ( onData?: ( data: string ) => void ) => {
	const downCmd = 'docker compose down -v';
	const upCmd = 'docker compose up -d';

	// First shut everything down with volumes
	await execAsyncStream( downCmd, onData, {
		cwd: DEPLOY_DIR
	} );

	// Then start everything back up
	await execAsyncStream( upCmd, onData, {
		cwd: DEPLOY_DIR
	} );

	return true;
};

export const getLogs = async ( service?: string, lines = 100 ) => {
	const baseCmd = `docker compose logs --tail=${ lines }`;
	const cmd = service ? `${ baseCmd } ${ service }` : baseCmd;
	const { stdout } = await execAsync( cmd, { cwd: DEPLOY_DIR } );
	return stdout;
};
