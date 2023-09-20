'use strict';

const querystring = require( 'querystring' );
const Page = require( 'wdio-mediawiki/Page' );

/**
 * Based on http://webdriver.io/guide/testrunner/pageobjects.html
 */
class PagePatch extends Page {

	/**
	 * Navigate the browser to a given page.
	 *
	 * @since 1.0.0
	 * @see <http://webdriver.io/api/protocol/url.html>
	 * @param {string} title Page title
	 * @param {Object} [query] Query parameter
	 * @param {string} [fragment] Fragment parameter
	 * @return {void} This method runs a browser command.
	 */
	async openTitle( title, query = {}, fragment = '' ) {
		query.title = title;
		await browser.url(
			browser.options.baseUrl + '/index.php?' +
			querystring.stringify( query ) +
			( fragment ? ( '#' + fragment ) : '' )
		);
	}
}

module.exports = PagePatch;
