import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';

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

export default function loadEnvFiles(
	envFilePaths: string[]
): Record<string, string> {
	let envVars = {};
	envFilePaths
		.filter( ( envFilePath ) => envFilePath )
		.forEach( ( envFilePath ) => {
			envVars = loadEnvFile( envFilePath, envVars );
		} );

	return envVars;
}
