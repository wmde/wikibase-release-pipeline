interface SelectionOptions {
	command: string;
	noun: string;
	requireExplicit?: boolean;
}

export function resolveNames(
	requested: string[],
	available: string[],
	options: SelectionOptions
): string[] {
	if ( requested.length === 0 ) {
		if ( options.requireExplicit ) {
			throw new Error(
				`${ options.command } requires a ${ options.noun } name or "all".`
			);
		}
		return available;
	}

	if ( requested.includes( 'all' ) ) {
		if ( requested.length !== 1 ) {
			throw new Error(
				`${ options.command }: "all" cannot be combined with ${ options.noun } names.`
			);
		}
		return available;
	}

	const unknown = requested.filter( ( name ) => !available.includes( name ) );
	if ( unknown.length > 0 ) {
		throw new Error(
			`${ options.command }: unknown ${ options.noun }${ unknown.length === 1 ? '' : 's' } ${ unknown.join( ', ' ) }. ` +
				`Available ${ options.noun }s: ${ available.join( ', ' ) }.`
		);
	}

	return [ ...new Set( requested ) ];
}
