import LoginPage from 'wdio-mediawiki/LoginPage.js';

describe( 'Babel', function () {
	beforeEach( async function () {
		await browser.skipIfExtensionNotPresent( this, 'Babel' );
	} );

	it( 'Should be able to update the user page with language skills', async function () {
		await LoginPage.login(
			testEnv.vars.MW_ADMIN_NAME,
			testEnv.vars.MW_ADMIN_PASS
		);

		const executionContent = await browser.editPage(
			testEnv.vars.WIKIBASE_URL,
			'User:' + testEnv.vars.MW_ADMIN_NAME,
			'{{#babel: sv | en }}'
		);

		expect( executionContent ).toMatch(
			'Den här användaren har svenska som modersmål.'
		);
		expect( executionContent ).toMatch(
			'This user has a native understanding of English.'
		);
	} );
} );
