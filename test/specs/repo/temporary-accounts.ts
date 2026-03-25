import page from '../../helpers/pages/page.js';

describe( 'Temporary Accounts', function () {
	beforeEach( async function () {
		await browser.deleteCookies();
	} );

	it( 'Should attribute an anonymous edit to a temporary account instead of an IP', async function () {
		const stamp = Date.now();
		const pageTitle = `Temporary_account_smoke_${ stamp }`;
		const pageContent = `Temporary account smoke test ${ stamp }`;

		await browser.editPage(
			testEnv.vars.WIKIBASE_URL,
			pageTitle,
			pageContent
		);

		await page.open( `/wiki/${ pageTitle }?action=history` );

		const firstRegisteredUserLink = $( '#pagehistory .mw-userlink' );
		await browser.waitUntil(
			async () => await firstRegisteredUserLink.isDisplayed(),
			{
				timeout: 10000,
				timeoutMsg: 'Expected a user link in page history after creating a temporary account'
			}
		);
		const actorName = await firstRegisteredUserLink.getText();
		const anonUserLinks = await $$( '#pagehistory .mw-anonuserlink' );

		expect( actorName.startsWith( '~' ) ).toBeTruthy();
		await expect( anonUserLinks ).toHaveLength( 0 );
	} );
} );
