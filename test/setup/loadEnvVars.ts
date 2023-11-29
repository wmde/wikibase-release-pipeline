import dotenv, { DotenvConfigOptions } from 'dotenv';
import dotenvExpand, { DotenvExpandOutput } from 'dotenv-expand';

export function loadEnvVars(
	envFilePath: string,
	opts: DotenvConfigOptions = {}
): DotenvExpandOutput {
	const result = dotenvExpand.expand(
		dotenv.config( {
			override: true,
			...opts,
			path: envFilePath
		} )
	);

	if (result.error) {
		throw result.error
	}

	return result
}

export default loadEnvVars;
