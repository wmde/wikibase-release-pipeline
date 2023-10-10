/**
 * Patches the use of `browser.config` in the screenshot-related code in
 * https://gerrit.wikimedia.org/r/plugins/gitiles/mediawiki/core/+/refs/heads/wmf/1.40.0-wmf.24/tests/selenium/wdio-mediawiki/index.js
 * TODO: Update wdio-mediawiki, remove this file.
 * See https://phabricator.wikimedia.org/T347137
 */

import { mkdirSync, statSync } from 'fs';
import { makeFilenameDate } from 'wdio-mediawiki';

/**
 * @since 1.1.0
 * @param {string} title Test title
 * @return {string} File name friendly version of the test title
 */
function testTitle( title ) {
	return encodeURIComponent( title.replace( /\s+/g, '-' ) );
}

/**
 * @since 1.1.0
 * @param {string} screenshotPath Screenshot path
 * @param {string} title Test title
 * @param {string} extension png for screenshots, mp4 for videos
 * @return {string} Full path of screenshot/video file
 */
function filePath( screenshotPath, title, extension ) {
	return `${screenshotPath}/${testTitle( title )}-${makeFilenameDate()}.${extension}`;
}

/**
 * Based on <https://github.com/webdriverio/webdriverio/issues/269#issuecomment-306342170>
 *
 * @since 1.0.0
 * @param {string} screenshotPath Screenshot Path
 * @param {string} title Description (will be sanitised and used as file name)
 * @return {string} File path
 */
function saveScreenshot( screenshotPath, title ) {
	// Create sensible file name for current test title
	const path = filePath( title, 'png' );
	// Ensure directory exists, based on WebDriverIO#saveScreenshotSync()
	try {
		statSync( screenshotPath );
	} catch ( err ) {
		mkdirSync( screenshotPath );
	}
	// Create and save screenshot
	browser.saveScreenshot( path );
	return path;
}

export default saveScreenshot;
