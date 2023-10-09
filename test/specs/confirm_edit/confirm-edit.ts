import assert from 'assert';

describe( 'ConfirmEdit', () => {
	it( 'Should allow to edit with captcha', async () => {
		const executionResult = await browser.editPage(
			process.env.MW_SERVER,
			'ConfirmEditTest',
			'something great',
			'paris'
		);

		assert.strictEqual( executionResult, 'something great' );
	} );
} );
