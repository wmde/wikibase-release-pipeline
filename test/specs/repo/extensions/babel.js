import assert from 'assert';
import SuiteLoginPage from '../../../helpers/pages/SuiteLoginPage.js';
import defaultFunctions from '../../../helpers/default-functions.js';

describe( 'Babel', function () {
	it( 'Should be able to update the user page with language skills', async () => {
		defaultFunctions.skipIfExtensionNotPresent( this, 'Babel' );

		await SuiteLoginPage.loginAdmin();

		const executionContent = await browser.editPage(
			process.env.MW_SERVER,
			'User:' + process.env.MW_ADMIN_NAME,
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
