describe( 'Special:RecentChanges', function () {
	it( 'Should be able to change limit', async () => {
		await browser.url(
			`${testEnv.vars.WIKIBASE_URL}/wiki/Special:RecentChanges?limit=50&days=7&urlversion=2&enhanced=0`
		);
		await expect(
			$( 'div.mw-rcfilters-ui-changesLimitAndDateButtonWidget' )
		).toHaveTextContaining( '50 changes' );
		await $( 'div.mw-rcfilters-ui-changesLimitAndDateButtonWidget' ).click();
		await $( 'div.mw-rcfilters-ui-changesLimitPopupWidget' )
			.$( 'span=100' )
			.click();
		await expect(
			$( 'div.mw-rcfilters-ui-changesLimitAndDateButtonWidget' )
		).toHaveTextContaining( '100 changes' );
	} );

	it( 'Should be able to change time to 2 hours', async () => {
		await browser.url(
			`${testEnv.vars.WIKIBASE_URL}/wiki/Special:RecentChanges?limit=50&days=7&urlversion=2&enhanced=0`
		);
		await expect(
			$( 'div.mw-rcfilters-ui-changesLimitAndDateButtonWidget' )
		).toHaveTextContaining( '7 days' );
		await $( 'div.mw-rcfilters-ui-changesLimitAndDateButtonWidget' ).click();
		await $( 'div.mw-rcfilters-ui-datePopupWidget-hours' ).$( 'span=2' ).click();
		await expect(
			$( 'div.mw-rcfilters-ui-changesLimitAndDateButtonWidget' )
		).toHaveTextContaining( '2 hours' );
	} );

	it( 'Should be able to change time to 3 days', async () => {
		await browser.url(
			`${testEnv.vars.WIKIBASE_URL}/wiki/Special:RecentChanges?limit=50&days=7&urlversion=2&enhanced=0`
		);
		await expect(
			$( 'div.mw-rcfilters-ui-changesLimitAndDateButtonWidget' )
		).toHaveTextContaining( '7 days' );
		await $( 'div.mw-rcfilters-ui-changesLimitAndDateButtonWidget' ).click();
		await $( 'div.mw-rcfilters-ui-datePopupWidget-days' ).$( 'span=3' ).click();
		await expect(
			$( 'div.mw-rcfilters-ui-changesLimitAndDateButtonWidget' )
		).toHaveTextContaining( '3 days' );
	} );
} );
