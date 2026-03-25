import LoginPage from 'wdio-mediawiki/LoginPage.js';

const waitForVisualEditor = async (): Promise<void> => {
	await browser.waitUntil(
		async () => {
			const bodyClasses = await $( 'body' ).getAttribute( 'class' ) || '';
			return (
				!bodyClasses.includes( 've-loading' ) &&
				await $( '.ve-init-mw-desktopArticleTarget-toolbar.oo-ui-toolbar' ).isExisting() &&
				await $( '.ve-ce-attachedRootNode' ).isExisting()
			);
		},
		{
			timeout: 30000,
			timeoutMsg: 'Expected VisualEditor to load successfully'
		}
	);
};

const clickEditToOpenVisualEditor = async (): Promise<void> => {
	const editTab = $( '#ca-ve-edit a' );
	await browser.waitUntil(
		async () => await editTab.isClickable(),
		{
			timeout: 15000,
			timeoutMsg: 'Expected the VisualEditor edit tab to become clickable'
		}
	);
	await editTab.click();
	await waitForVisualEditor();
};

const appendTextInVisualEditor = async ( text: string ): Promise<void> => {
	const ready = await browser.execute( () => {
		const root = document.querySelector( '.ve-ce-attachedRootNode' );
		if ( !root ) {
			return false;
		}

		const walker = document.createTreeWalker( root, NodeFilter.SHOW_TEXT );
		let lastTextNode = null;
		while ( walker.nextNode() ) {
			lastTextNode = walker.currentNode;
		}

		const selection = window.getSelection();
		const range = document.createRange();
		if ( lastTextNode ) {
			range.setStart( lastTextNode, lastTextNode.textContent.length );
		} else {
			range.selectNodeContents( root );
		}
		range.collapse( false );
		selection.removeAllRanges();
		selection.addRange( range );
		root.focus();
		return true;
	} );

	if ( !ready ) {
		throw new Error( 'Could not focus the VisualEditor surface' );
	}

	await browser.keys( text.split( '' ) );
};

const saveVisualEditor = async (): Promise<void> => {
	const toolbarSaveButton = $( '.ve-ui-toolbar-saveButton' );
	await browser.waitUntil(
		async () => await toolbarSaveButton.isClickable(),
		{
			timeout: 10000,
			timeoutMsg: 'Expected the VisualEditor save button to become clickable'
		}
	);
	await toolbarSaveButton.click();

	const publishButton = $( '.oo-ui-processDialog-actions-primary .oo-ui-buttonElement-button' );
	await browser.waitUntil(
		async () => await publishButton.isClickable(),
		{
			timeout: 15000,
			timeoutMsg: 'Expected the VisualEditor publish button to become clickable'
		}
	);
	await publishButton.click();

	await browser.waitUntil(
		async () => {
			const currentUrl = await browser.getUrl();
			return !currentUrl.includes( 'veaction=edit' ) && !currentUrl.includes( 'action=edit' );
		},
		{
			timeout: 30000,
			timeoutMsg: 'Expected VisualEditor to finish saving and return to page view'
		}
	);
};

describe( 'VisualEditor', function () {
	beforeEach( async function () {
		await browser.skipIfExtensionNotPresent( this, 'VisualEditor' );
		await browser.deleteCookies();
	} );

	it( 'Should repeatedly reopen and save structured content in VisualEditor', async function () {
		const stamp = Date.now();
		const pageTitle = `VisualEditor_smoke_${ stamp }`;
		const seedContent = [
			'== VisualEditor smoke ==',
			'This page starts with [[Main Page|a link]] and structured content.',
			'',
			'* First item',
			'* Second item'
		].join( '\n' );

		await LoginPage.login(
			testEnv.vars.MW_ADMIN_NAME,
			testEnv.vars.MW_ADMIN_PASS
		);
		await browser.editPage(
			testEnv.vars.WIKIBASE_URL,
			pageTitle,
			seedContent
		);
		await browser.waitForJobs();
		await browser.url( `${ testEnv.vars.WIKIBASE_URL }/wiki/${ pageTitle }` );

		await clickEditToOpenVisualEditor();
		await appendTextInVisualEditor( ` Smoke pass one ${ stamp }` );
		await saveVisualEditor();

		await clickEditToOpenVisualEditor();
		await appendTextInVisualEditor( ' Smoke pass two' );
		await saveVisualEditor();

		await clickEditToOpenVisualEditor();
	} );
} );
