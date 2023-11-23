import axios from 'axios';
import asyncWaitUntil from 'async-wait-until';

const { waitUntil, TimeoutError } = asyncWaitUntil;

async function checkIfUp(
	serviceURL: string,
	// default timeout is 1 second less than default Mocha test timeout
	timeout: number = ( Number.parseInt( process.env.MOCHA_OPTS_TIMEOUT ) ||
    90 * 1000 ) - 1000,
	timeoutMsg: string = null
): Promise<void> {
	try {
		const predicate = async (): Promise<boolean> => {
			try {
				await axios.get( serviceURL );
				return true;
			} catch ( e ) {
				return false;
			}
		};
		await waitUntil( predicate, { timeout } );
		console.log( `ℹ️  Successfully loaded ${serviceURL}` );
	} catch ( e ) {
		if ( e instanceof TimeoutError ) {
			throw (
				timeoutMsg ||
					new Error( `❌ Could not load ${serviceURL} after ${timeout / 1000} seconds.` )
			);
		} else {
			throw (
				new Error( `❌ Could not load ${serviceURL} with error: ${e}` )
			);
		}
	}
}

export default checkIfUp;
