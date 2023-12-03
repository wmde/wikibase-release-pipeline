import dotenv from 'dotenv';
import dotenvExpand, { DotenvExpandOutput } from 'dotenv-expand';

export function loadEnvFile(
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

	const envVars = dotenvExpand.expand( { parsed: providedEnvvars, ignoreProcessEnv: true } );

	return envVars.parsed;
}

export default function loadEnvFiles(
	envFilePaths: string[]
) {
	let envVars: Record<string, string> = {};

	envFilePaths
		.filter( ( envFilePath ) => envFilePath )
		.forEach( ( envFilePath ) => {
			envVars = loadEnvFile( envFilePath, envVars );
		} );

	return envVars;
}
