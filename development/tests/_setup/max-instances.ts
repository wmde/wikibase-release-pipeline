export function applyMaxInstancesCap(
	suiteMaxInstances: number,
	rawCap: string | undefined
): number {
	if ( rawCap === undefined || rawCap === '' ) {
		return suiteMaxInstances;
	}
	if ( !/^[1-9]\d*$/u.test( rawCap ) ) {
		throw new Error( 'WBS_TEST_MAX_INSTANCES must be a positive integer.' );
	}
	return Math.min( suiteMaxInstances, Number( rawCap ) );
}
