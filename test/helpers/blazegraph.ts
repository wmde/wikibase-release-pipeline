import Binding from "./types/binding.js";

export function getElementByURI<T>( uri: T, bindings : Binding<T>[] ): Binding<T> | null {
	const index = bindings.findIndex( ( binding ) => binding.p.value === uri );
	return index === -1 ? null : bindings[ index ];
};
