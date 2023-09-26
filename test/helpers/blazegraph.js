'use strict';

const lodash = require( 'lodash' );

const getElementByURI = function ( uri, bindings ) {
	const index = lodash.findIndex( bindings, function ( binding ) {
		return binding.p.value === uri;
	} );
	return index === -1 ? [] : bindings[ index ];
};

module.exports = {
	getElementByURI: getElementByURI
};
