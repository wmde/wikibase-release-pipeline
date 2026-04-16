class RepoClientLoginPage {
	public get username(): ChainablePromiseElement {
		return $( '#wpName1' );
	}

	public get password(): ChainablePromiseElement {
		return $( '#wpPassword1' );
	}

	public get loginButton(): ChainablePromiseElement {
		return $( '#wpLoginAttempt' );
	}

	public get logoutLink(): ChainablePromiseElement {
		return $( '#pt-logout' );
	}

	public async open(): Promise<void> {
		await browser.url(
			`${ testEnv.vars.WIKIBASE_CLIENT_URL }/wiki/Special:UserLogin`
		);
	}

	public async login( username: string, password: string ): Promise<void> {
		await this.open();
		await this.username.setValue( username );
		await this.password.setValue( password );
		await this.loginButton.click();
		await browser.waitUntil(
			async () => await this.logoutLink.isExisting(),
			{
				timeout: 10000,
				timeoutMsg: 'Expected to be logged in on the client wiki'
			}
		);
	}
}

export default new RepoClientLoginPage();
