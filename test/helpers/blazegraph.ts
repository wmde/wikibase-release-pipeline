export function getElementByURI  ( uri: string, bindings: any[] ) {
	const index = bindings.findIndex((binding) => binding.p.value == uri);
	return index === -1 ? [] : bindings[ index ];
};
