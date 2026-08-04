import semver from 'semver';

const STABLE_VERSION = /^\d+\.\d+\.\d+$/u;

export function assertStableVersion( version: string, context: string ): void {
	if ( !STABLE_VERSION.test( version ) || !semver.valid( version ) ) {
		throw new Error(
			`${ context } must use a stable MAJOR.MINOR.PATCH version; received "${ version }".`
		);
	}
}
