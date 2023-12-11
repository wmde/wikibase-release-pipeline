import assert from 'assert';
import LoginPage from 'wdio-mediawiki/LoginPage.js';
import envVars from '../../../setup/envVars.js';

describe( 'Babel', function () {
	beforeEach( async function () {
		await browser.skipIfExtensionNotPresent( this, 'Babel' );
	} );

	it( 'Should be able to update the user page with language skills', async () => {
		await LoginPage.login( envVars.MW_ADMIN_NAME, envVars.MW_ADMIN_PASS );

		const executionContent = await browser.editPage(
			envVars.WIKIBASE_URL,
			'User:' + envVars.MW_ADMIN_NAME,
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
