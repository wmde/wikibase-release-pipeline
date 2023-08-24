'use strict';
class Page {
	constructor() {
	}

	open( path ) {
		browser.url( 'http://' + process.env.WDQS_FRONTEND_SERVER + path );
	}
}
module.exports = Page;
