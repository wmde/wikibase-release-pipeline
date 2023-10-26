'use strict';

const Page = require( './Page' );

class LoginPage extends Page {
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
		let username, password;
		if ( browser.config ) {
			username = browser.config.mwUser;
			password = browser.config.mwPwd;
		} else {
			username = process.env.MW_ADMIN_NAME;
			password = process.env.MW_ADMIN_PASS;
		}
		await this.login( username, password );
	}
}

module.exports = new LoginPage();
