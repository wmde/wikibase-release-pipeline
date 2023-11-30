import dotenv, { DotenvConfigOptions, DotenvPopulateInput } from 'dotenv';
import dotenvExpand, { DotenvExpandOutput } from 'dotenv-expand';

export function loadEnvFile(
	envFilePath: string,
	setProcessEnv: boolean = false,
	opts: DotenvConfigOptions = {}
): DotenvExpandOutput {
	const unexpandedEnvVars: DotenvPopulateInput = {};

	const result = dotenv.config( {
		...opts,
		override: true,
		path: envFilePath,
		processEnv: setProcessEnv ? process.env : unexpandedEnvVars
	} );

	if (result.error) {
		throw result.error
	}

	const envVars = dotenvExpand.expand( { parsed: unexpandedEnvVars, ignoreProcessEnv: !setProcessEnv } );

	return envVars.parsed
}

export default function loadEnvFiles(
	envFilePaths: string[],
	setProcessEnv = false,
	opts = {}
) {
	let envVars: Record<string, string> = {};

	envFilePaths
		.filter( ( envFilePath ) => envFilePath )
		.forEach( ( envFilePath ) => {
			envVars = Object.assign( envVars, loadEnvFile( envFilePath, setProcessEnv, opts ) );
		} );

	return envVars;
}
