import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';

export let envVars: Record<string, string> = {};

function loadEnvFile(
	envFilePath: string,
	providedEnvvars: Record<string, string> = {}
): Record<string, string> {
	const result = dotenv.config( {
		override: true,
		path: envFilePath,
		processEnv: providedEnvvars
	} );

	if ( result.error ) {
		throw result.error;
	}

	const envVarsResult = dotenvExpand.expand( {
		parsed: providedEnvvars, ignoreProcessEnv: true
	} );

	return envVarsResult.parsed;
}

export function loadEnvFiles(
	envFilePaths: string[]
): Record<string, string> {
	envVars = {};
	envFilePaths
		.filter( ( envFilePath ) => envFilePath )
		.forEach( ( envFilePath ) => {
			envVars = loadEnvFile( envFilePath, envVars );
		} );

	return envVars;
}

export default envVars;
