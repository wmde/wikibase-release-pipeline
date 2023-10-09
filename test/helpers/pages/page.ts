class Page {
	constructor() {}

	async open( path: string ) {
		await browser.url( 'http://' + process.env.WDQS_FRONTEND_SERVER + path );
	}
}

export default Page;
