'use strict';

const { assert } = require( 'console' );
const Util = require( 'wdio-mediawiki/Util' );
const WikibaseApi = require( 'wdio-wikibase/wikibase.api' );
const defaultFunctions = require( '../../helpers/default-functions' );

const itemAlias = Util.getTestString( 'alias' );
const itemLabel = Util.getTestString( 'testItem' );

describe( 'ElasticSearch', function () {

	before( function () {
		defaultFunctions();
	} );

	let itemId = null;

	it( 'Should create an item', function () {

		itemId = browser.call(
			() => WikibaseApi.createItem( itemLabel )
		);
		browser.url( process.env.MW_SERVER + '/wiki/Item:' + itemId );
		$( '.wikibase-toolbarbutton.wikibase-toolbar-item.wikibase-toolbar-button.wikibase-toolbar-button-add' ).waitForDisplayed();
	} );

	it( 'Should be able to set alias', function () {

		browser.url( process.env.MW_SERVER + '/wiki/Special:SetAliases/' );

		// input id
		$( '#wb-modifyentity-id input' ).waitForDisplayed();
		$( '#wb-modifyentity-id input' ).setValue( itemId );

		// input alias term and submit
		$( '#wb-modifyterm-value input' ).waitForDisplayed();
		$( '#wb-modifyterm-value input' ).setValue( itemAlias );
		$( 'button.oo-ui-inputWidget-input' ).click();

		// alias should be visible on item page
		$( '.wikibase-aliasesview-list-item' ).waitForDisplayed();
		const alias = $( '.wikibase-aliasesview-list-item' ).getText();
		assert( alias === itemAlias );
	} );

	it.skip( 'Should able able to run UpdateSearchIndexConfig.php', function () {

		const result = browser.dockerExecute(
			process.env.DOCKER_WIKIBASE_REPO_NAME,
			'php extensions/CirrusSearch/maintenance/UpdateSearchIndexConfig.php --startOver'
		);

		assert( result.includes( 'content index...' ) === true );
		assert( result.includes( 'general index...' ) === true );
		assert( result.includes( 'archive index...' ) === true );

	} );

	it.skip( 'Should be able to run ForceSearchIndex.php', function () {

		// run jobs detached
		browser.dockerExecute(
			process.env.DOCKER_WIKIBASE_REPO_NAME,
			"bash -c 'php /var/www/html/maintenance/runJobs.php --wiki my_wiki --wait --maxjobs 2 > /var/log/runJobs.log'",
			'--detach'
		);

		const resultCommand = browser.dockerExecute(
			process.env.DOCKER_WIKIBASE_REPO_NAME,
			'php extensions/CirrusSearch/maintenance/ForceSearchIndex.php --queue --maxJobs 10000 --pauseForJobs 1000 --skipLinks --indexOnSkip'
		);

		const logResult = browser.dockerExecute(
			process.env.DOCKER_WIKIBASE_REPO_NAME,
			'cat /var/log/runJobs.log'
		);

		assert( logResult.includes( 'cirrusSearchMassIndex Special: pageDBKeys=["Main_Page","Item:Q1"]' ) === true );
		assert( logResult.includes( 'cirrusSearchElasticaWrite' ) === true );

		// should have queued some stuff
		assert( resultCommand.includes( 'Queued a total of' ) === true );
	} );

	it( 'should be able to search case-insensitive', function () {

		// wait for elasticsearch
		browser.pause( 10 * 1000 );

		// Search for uppercase Test
		browser.url( process.env.MW_SERVER + '/wiki/Special:Search' );
		$( '#searchText input' ).waitForDisplayed();
		$( '#searchText input' ).setValue( 'Test' );
		$( 'button.oo-ui-inputWidget-input' ).click();

		$( 'li.mw-search-result a' ).waitForDisplayed();
		const searchHit = $( 'li.mw-search-result a' ).getText();
		assert( searchHit === itemLabel + ' (' + itemId + ')' );
	} );

	it( 'should be able to search via alias', function () {

		// Search for alias "alias"
		browser.url( process.env.MW_SERVER + '/wiki/Special:Search' );
		$( '#searchText input' ).waitForDisplayed();
		$( '#searchText input' ).setValue( 'alias' );
		$( 'button.oo-ui-inputWidget-input' ).click();

		$( 'li.mw-search-result a' ).waitForDisplayed();
		const searchHit = $( 'li.mw-search-result a' ).getText();
		assert( searchHit === itemLabel + ' (' + itemId + ')' );
	} );
} );
