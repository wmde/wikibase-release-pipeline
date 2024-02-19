/**
 * `$( '=P1 (P1)' )`
 *
 * @param {string} id
 * @return {Object}
 */
const propertyIdSelector = ( id: string ): ChainablePromiseElement =>
	$( `=${id} (${id})` );

export default propertyIdSelector;
