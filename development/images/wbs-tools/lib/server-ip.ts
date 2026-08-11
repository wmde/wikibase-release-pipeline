import { isIP } from 'node:net';

const PUBLIC_IP_ENDPOINT = 'https://api.ipify.org';

export async function resolveServerIp( local: boolean ): Promise<string> {
	const configured = ( process.env.SERVER_IP || '' ).trim();
	if ( configured ) {
		if ( isIP( configured ) !== 4 ) {
			throw new Error( 'SERVER_IP must be an IPv4 address.' );
		}
		return configured;
	}

	if ( local ) {
		return '127.0.0.1';
	}

	try {
		const response = await fetch( PUBLIC_IP_ENDPOINT, {
			signal: AbortSignal.timeout( 10_000 )
		} );
		if ( !response.ok ) {
			throw new Error( `HTTP ${ response.status }` );
		}
		const detected = ( await response.text() ).trim();
		if ( isIP( detected ) !== 4 ) {
			throw new Error( 'response was not an IPv4 address' );
		}
		return detected;
	} catch ( error ) {
		const reason = error instanceof Error ? ` (${ error.message })` : '';
		throw new Error(
			`Could not determine this server's public IPv4 address${ reason }. ` +
			'Set SERVER_IP in local.env and retry.'
		);
	}
}
