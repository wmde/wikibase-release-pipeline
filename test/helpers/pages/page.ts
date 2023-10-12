class Page {
	constructor() {}

	async open( path: string ): Promise<void> {
		await browser.url( `http://${process.env.WDQS_FRONTEND_SERVER}${path}` );
	}
}

export default Page;
