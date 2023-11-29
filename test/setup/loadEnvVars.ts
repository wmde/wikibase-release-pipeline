import dotenv, { DotenvConfigOptions } from 'dotenv';
import dotenvExpand, { DotenvExpandOutput } from 'dotenv-expand';

export function loadEnvVars(
	envFilePath: string,
	opts: DotenvConfigOptions = {}
): DotenvExpandOutput {
	return dotenvExpand.expand(
		dotenv.config( {
			override: true,
			...opts,
			path: envFilePath
		} )
	);
}

export default loadEnvVars;
