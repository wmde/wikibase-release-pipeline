'use strict';

const Page = require( 'wdio-mediawiki/Page' );

// This is a replacement for `wdio-mediawiki/LoginPage`
// which as of version 2.2.0 does not properly await WDIO elements
// causing failures and otherwise unpredictable results.
// TODO: Fix upstream code in `wdio-mediawiki/LoginPage`
class SuiteLoginPage extends Page {
	get username() { return $( '#wpName1' ); }
	get password() { return $( '#wpPassword1' ); }
	get loginButton() { return $( '#wpLoginAttempt' ); }
	get userPage() { return $( '#pt-userpage' ); }

	open() {
		super.openTitle( 'Special:UserLogin' );
	}

	async login( username, password ) {
		await this.open();

		const usernameEl = await this.username;
		await usernameEl.waitForDisplayed();
		await usernameEl.setValue( username );

		const passwordEl = await this.password;
		await passwordEl.waitForDisplayed();
		await passwordEl.setValue( password );

		const loginButtonEl = await this.loginButton;
		await loginButtonEl.waitForDisplayed();
		await loginButtonEl.click();
	}

	async loginAdmin() {
		await this.login( browser.config.mwUser, browser.config.mwPwd );
	}
}

module.exports = new SuiteLoginPage();
