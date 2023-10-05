import { findIndex } from 'lodash';

export const getElementByURI = function ( uri, bindings ) {
	const index = findIndex( bindings, ( binding ) => binding.p.value === uri );
	return index === -1 ? [] : bindings[ index ];
};
