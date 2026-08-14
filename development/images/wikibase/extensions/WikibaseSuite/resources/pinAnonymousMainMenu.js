/* global mw, document, window, Event */

( function () {
	if ( mw.config.get( 'wgUserName' ) !== null ) {
		return;
	}

	const header = document.querySelector(
		'#vector-main-menu .vector-pinnable-header'
	);
	if ( !header ) {
		return;
	}

	const menu = document.getElementById( 'vector-main-menu' );
	const pinnedContainer = document.getElementById(
		'vector-main-menu-pinned-container'
	);
	if ( !menu || !pinnedContainer ) {
		return;
	}

	document.documentElement.classList.remove(
		'vector-feature-main-menu-pinned-disabled'
	);
	document.documentElement.classList.add(
		'vector-feature-main-menu-pinned-enabled'
	);
	header.classList.remove( 'vector-pinnable-header-unpinned' );
	header.classList.add( 'vector-pinnable-header-pinned' );
	header.dataset.savedPinnedState = 'true';
	pinnedContainer.append( menu );
	window.dispatchEvent( new Event( 'resize' ) );
}() );
