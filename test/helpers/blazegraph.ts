import Binding from "./types/binding.js";

export function getElementByURI<T>( uri: T, bindings : Binding<T>[] ): never[] | Binding<T> {
	const index = bindings.findIndex( ( binding ) => binding.p.value === uri );
	return index === -1 ? [] : bindings[ index ];
};
