import dotenv, { DotenvConfigOptions } from 'dotenv';
import dotenvExpand, { DotenvExpandOutput } from 'dotenv-expand';

export function loadEnvVars(
	envFilePath: string,
	opts: DotenvConfigOptions = {}
): DotenvExpandOutput {
	const envVars = {};

	dotenv.config( {
		override: true,
		...opts,
		path: envFilePath,
		processEnv: envVars
	} );

	return dotenvExpand.expand( {
		ignoreProcessEnv: false,
		parsed: envVars
	} );
}

export default loadEnvVars;
