/**
 * @param {Object} parameters
 * @return {string} `?param1=${param1}&param2=${param2}`
 */
function urlParameters( parameters: object ): string {
	const output: string[] = Object.keys( parameters )
		.filter( ( key: string ) => parameters[ key ] !== null )
		.map( ( key: string ) => `${key}=${parameters[ key ]}` );
	return output.length > 0 ? `?${output.join( '&' )}` : '';
}

export default urlParameters;
