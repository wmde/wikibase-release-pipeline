import LoginPage from 'wdio-mediawiki/LoginPage.js';

class TestLoginPage {
	public async login( username: string, password: string ): Promise<void> {
		await LoginPage.login( username, password );
		await $( '#pt-userpage, #pt-userpage-2' ).waitForExist();
	}
}

export default new TestLoginPage();
