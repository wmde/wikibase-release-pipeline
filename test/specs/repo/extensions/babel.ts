import assert from 'assert';
import LoginPage from 'wdio-mediawiki/LoginPage.js';
import { skipIfExtensionNotPresent } from '../../../helpers/default-functions.js';

describe( 'Babel', function () {
	beforeEach( async function () {
		await skipIfExtensionNotPresent( this, 'Babel' );
	} );

	it( 'Should be able to update the user page with language skills', async () => {
		await LoginPage.login( globalThis.env.MW_ADMIN_NAME, globalThis.env.MW_ADMIN_PASS );

		const executionContent = await browser.editPage(
			globalThis.env.MW_SERVER,
			'User:' + globalThis.env.MW_ADMIN_NAME,
			'{{#babel: sv | en }}'
		);

		assert.strictEqual(
			executionContent.includes(
				'Den här användaren har svenska som modersmål.'
			),
			true
		);
		assert.strictEqual(
			executionContent.includes(
				'This user has a native understanding of English.'
			),
			true
		);
	} );
} );
