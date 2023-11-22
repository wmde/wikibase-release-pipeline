import axios from 'axios';
import asyncWaitUntil from 'async-wait-until';

const { waitUntil, TimeoutError } = asyncWaitUntil;

async function checkIfUp(
	serverURL: string,
	// default timeout is 1 second less than default Mocha test timeout
	timeout: number = ( Number.parseInt( process.env.MOCHA_OPTS_TIMEOUT ) ||
    90 * 1000 ) - 1000,
	timeoutMsg: string = null
): Promise<void> {
	try {
		const predicate = async () => {
			try {
				await axios.get( serverURL );
				return true;
			} catch ( e ) {
				return false;
			}
		};
		await waitUntil( predicate, { timeout } );
		console.log( `ℹ️  Successfully loaded ${serverURL}` );
	} catch ( e ) {
		if ( e instanceof TimeoutError ) {
			console.log(
				timeoutMsg ||
          `❌ Could not load ${serverURL} after ${
          	timeout / 1000
          } seconds.`
			);
		} else {
			console.log(
				`❌ Could not load ${serverURL} with error: ${e}`
			);
		}
	}
}

export default checkIfUp;
