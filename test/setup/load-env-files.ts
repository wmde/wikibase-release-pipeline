import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import { existsSync } from 'fs';

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
		processEnv: {}
	} );

	return expandedEnvVars;
}

export default function loadEnvFiles(
	envFilePaths: string[]
): Record<string, string> {
	let envVars = {};
	envFilePaths
		// eslint-disable-next-line security/detect-non-literal-fs-filename
		.filter( ( envFilePath ) => envFilePath && existsSync( envFilePath ) )
		.forEach( ( envFilePath ) => {
			envVars = loadEnvFile( envFilePath, envVars );
		} );

	return envVars;
}
