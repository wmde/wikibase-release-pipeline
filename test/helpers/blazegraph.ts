import Binding from "./types/binding.js";

export function getElementByURI( uri: string, bindings : Binding[] ): Binding | null {
	const index = bindings.findIndex( ( binding ) => binding.p.value === uri );
	return index === -1 ? null : bindings[ index ];
}
