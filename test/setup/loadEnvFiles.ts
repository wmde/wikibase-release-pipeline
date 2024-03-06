import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';

function loadEnvFile(
	envFilePath: string,
	providedEnvvars: Record<string, string> = {}
): Record<string, string> {
	const { parsed: envVarsFromFile, error } = dotenv.config( {
		override: true,
		path: envFilePath,
		// Ignore process.env values, and don't set them
		processEnv: {}
	} );

	if ( error ) {
		throw error;
	}

	const envVars = { ...providedEnvvars, ...envVarsFromFile };
	const { parsed: expandedEnvVars } = dotenvExpand.expand( {
		parsed: envVars,
		ignoreProcessEnv: true
	} );

	return expandedEnvVars;
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
