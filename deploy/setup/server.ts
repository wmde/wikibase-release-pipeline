import { createSession, createChannel } from 'better-sse';
import { Eta } from 'eta';
import express from 'express';
import { existsSync, readFileSync, createReadStream } from 'fs';
import { writeFile, readFile } from 'fs/promises';
import https, { request } from 'https';
import { dirname, join } from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { getConfig } from './getConfig.js';

const fileName = fileURLToPath( import.meta.url );
const dirName = dirname( fileName );

// Constants
const ENV_FILE_PATH = '/app/deploy/.env';
const LOG_PATH = '/app/setup.log';
const SSL_CERT_KEY_PATH = '/app/certs/key.pem';
const SSL_CERT_PATH = '/app/certs/cert.pem';
// 10 minutes
const AUTO_FINALIZE_TIMEOUT_MS = 10 * 60 * 1000;

// Express setup
const app = express();
app.use( express.static( join( dirName, 'public' ) ) );
app.use( express.json() );

// Eta setup
const eta = new Eta( {
	views: join( dirName, 'views' ),
	cache: false,
	useWith: true
} );

// Helpers
function isBooted(): boolean {
	if ( !existsSync( LOG_PATH ) ) {
		return false;
	}
	const log = readFileSync( LOG_PATH, 'utf8' );
	return log.includes( 'Setup is Complete!' );
}

// ---------- Routes ----------
app.get( '/', async ( req, res ) => {
	try {
		const { config, isConfigSaved } = getConfig();
		const html = eta.render( 'index.eta', {
			...config,
			isConfigSaved,
			isBooted: isBooted(),
			SERVER_IP: process.env.SERVER_IP
		} );
		if ( !html ) {
			throw new Error( 'Eta render returned null' );
		}
		res.type( 'html' ).send( html );
	} catch ( err ) {
		console.error( 'Failed to render template:', err );
		res.status( 500 ).send( 'Template render error' );
	}
} );

const logChannel = createChannel();

// Single log endpoint with backfill of the entire file on fresh page load
app.get( '/log/stream', async ( req, res ) => {
	const session = await createSession( req, res );
	logChannel.register( session );

	// Backfill ENTIRE log only on a fresh page load (skip on auto-reconnects)
	const isReconnect = typeof req.headers[ 'last-event-id' ] === 'string' && req.headers[ 'last-event-id' ] !== '';
	if ( !isReconnect && existsSync( LOG_PATH ) ) {
		const rs = createReadStream( LOG_PATH, { encoding: 'utf8' } );
		const rl = readline.createInterface( { input: rs, crlfDelay: Infinity } );
		await session.batch( async ( buffer ) => {
			for await ( const line of rl ) {
				if ( line ) {
					buffer.push( line ); // one SSE message per log line
				}
			}
		} );
	}
} );

app.post( '/config', async ( req, res ): Promise<void> => {
	try {
		const { configText } = getConfig( req.body );
		await writeFile( ENV_FILE_PATH, configText );
		console.log( '.env file written successfully' );
		res.status( 200 ).json( { status: 'ok', configText } );
	} catch ( err ) {
		console.error( 'Failed to write .env:', err );
		res.status( 500 ).send( 'Failed to write .env' );
	}
} );

app.get( '/config', async ( req, res ): Promise<void> => {
	try {
		const configText = await readFile( ENV_FILE_PATH, 'utf8' );
		res.status( 200 ).json( { configText } );
	} catch ( err ) {
		console.error( 'Failed to read .env:', err );
		res.status( 500 ).send( 'Failed to read .env' );
	}
} );

app.post( '/finalize-setup', async ( req, res ) => {
	try {
		if ( existsSync( ENV_FILE_PATH ) ) {
			const lines = ( await readFile( ENV_FILE_PATH, 'utf8' ) ).split( '\n' );
			// blank password values
			const sanitized = lines.map( ( line ) =>
				line.replace( /^(.*_PASS(?:WORD)?=).+$/, '$1' )
			);
			await writeFile( ENV_FILE_PATH, sanitized.join( '\n' ) );
			console.log( '🧼 Passwords sanitized' );
		}

		if ( existsSync( LOG_PATH ) ) {
			await writeFile( LOG_PATH, '' );
			console.log( '🧹 Log cleared' );
		}

		res.status( 200 ).json( { status: 'finalized' } );
		console.log( '💤 Setup finalized. Exiting...' );
		// eslint-disable-next-line n/no-process-exit
		setTimeout( () => process.exit( 0 ), 300 ); // allow response to finish
	} catch ( err ) {
		console.error( '❌ Finalize error:', err );
		res.status( 500 ).send( 'Failed to finalize setup' );
	}
} );

// --- Broadcasters ---
// Log tailer: every 1s read lines and broadcast only the new ones
{
	let lastCount = 0;
	setInterval( () => {
		if ( !existsSync( LOG_PATH ) ) {
			return;
		}
		try {
			const lines = readFileSync( LOG_PATH, 'utf8' ).split( '\n' );
			if ( lines.length < lastCount ) {
				lastCount = 0;
			} // file truncated/cleared
			for ( let i = lastCount; i < lines.length; i++ ) {
				const line = lines[ i ];
				if ( line ) {
					logChannel.broadcast( line );
				}
			}
			lastCount = lines.length;
		} catch ( e ) {
			// ignore transient read errors
		}
	}, 1000 );
}

if ( !existsSync( SSL_CERT_PATH ) || !existsSync( SSL_CERT_KEY_PATH ) ) {
	throw new Error( 'Not able to access SSL certificate or key in /app/certs' );
}

const credentials = {
	cert: readFileSync( SSL_CERT_PATH ),
	key: readFileSync( SSL_CERT_KEY_PATH )
};

https.createServer( credentials, app ).listen( 443, () => {
	console.log( '✅ HTTPS server running at https://localhost:443' );
} );

// Kick off finalize if booted and inactive
setTimeout( () => {
	if ( isBooted() ) {
		console.log( '⏱️ Auto-finalizing setup after timeout...' );

		const req = request(
			{
				method: 'POST',
				host: 'localhost',
				port: 443,
				path: '/finalize-setup',
				rejectUnauthorized: false, // allow self-signed certs
				headers: {
					'Content-Type': 'application/json'
				}
			},
			( res ) => {
				if ( res.statusCode && res.statusCode >= 200 && res.statusCode < 300 ) {
					console.log( '✅ Auto-finalize complete' );
				} else {
					console.error( `❌ Auto-finalize failed: ${ res.statusCode }` );
				}
			}
		);

		req.on( 'error', ( err ) => {
			console.error( '❌ Auto-finalize request error:', err );
		} );

		req.end(); // no body needed
	} else {
		console.log( '⏱️ Auto-finalize skipped: not yet booted' );
	}
}, AUTO_FINALIZE_TIMEOUT_MS );
