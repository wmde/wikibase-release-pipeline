import { stringify } from 'querystring';
import Page from 'wdio-mediawiki/Page.js';

/**
 * Patches the use of `browser.config` in
 * https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/core/+/refs/heads/wmf/1.40.0-wmf.24/tests/selenium/wdio-mediawiki/Page.js
 * TODO: Update wdio-mediawiki, remove this file.
 * See https://phabricator.wikimedia.org/T347137
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
			browser.options.baseUrl +
			'/index.php?' +
			stringify( query ) +
			( fragment ? '#' + fragment : '' )
		);
	}
}

export default PagePatch;
