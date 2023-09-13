'use strict';
class Page {
	constructor() {
	}

	async open( path ) {
		await browser.url( 'http://' + process.env.WDQS_FRONTEND_SERVER + path );
	}
}
module.exports = Page;
