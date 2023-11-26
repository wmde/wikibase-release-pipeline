import dotenv, { DotenvConfigOptions } from 'dotenv';
import dotenvExpand, { DotenvExpandOutput } from 'dotenv-expand';

const defaultDotenvConfigOpts: DotenvConfigOptions = {
	override: true
};

export function loadEnvVars(
	envFilePath: string,
	opts: DotenvConfigOptions = {}
): DotenvExpandOutput {
	return dotenvExpand.expand(
		dotenv.config( {
			path: envFilePath,
			...defaultDotenvConfigOpts,
			...opts
		} )
	);
}

export default loadEnvVars;
