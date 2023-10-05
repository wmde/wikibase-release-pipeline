export const getElementByURI = function ( uri, bindings ) {
	const index = bindings.findIndex( ( binding ) => binding.p.value === uri );
	return index === -1 ? [] : bindings[ index ];
};
