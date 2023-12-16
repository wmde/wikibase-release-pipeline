class Page {
	public async open( path: string ): Promise<void> {
		await browser.url( `${testEnv.vars.WDQS_FRONTEND_URL}${path}` );
	}
}

export default Page;
