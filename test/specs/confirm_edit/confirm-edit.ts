import assert from 'assert';
import envVars from '../../setup/envVars.js';

describe( 'ConfirmEdit', function () {
	it( 'Should allow to edit with captcha', async () => {
		const executionResult = await browser.editPage(
			envVars.WIKIBASE_URL,
			'ConfirmEditTest',
			'something great',
			'paris'
		);

		assert.strictEqual( executionResult, 'something great' );
	} );
} );
