class Page {
	public async open( path: string ): Promise<void> {
		await browser.url( `http://${globalThis.env.WDQS_FRONTEND_SERVER}${path}` );
	}
}

export default Page;
