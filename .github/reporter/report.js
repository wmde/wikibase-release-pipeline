const fs = require( 'fs' );
const {
	extractModuleLineAndColumn
} = require( 'mocha-json-streamier-reporter/lib/parse-stack-trace' );
const core = require( '@actions/core' );
const { issueCommand } = require( '@actions/core/lib/command' );

const suiteName = process.argv[ 2 ];

if ( suiteName ) {
	return;
}

const filePath = `../../test/suites/${ suiteName }/results/result.json`;

let resultObject = {};

if ( fs.existsSync( filePath ) ) {
	resultObject = JSON.parse( fs.readFileSync( filePath, 'utf8' ) )[ suiteName ];

	if ( resultObject.fail.length != 0 ) {
		resultObject.fail.forEach( ( test ) => {
			const error = extractModuleLineAndColumn( test.error.stack );
			let filePath = '';
			if ( error.file ) {
				filePath = error.file.replace( '/usr/src/app/', 'test/' );
			}
			const message = test.fullTitle + ': ' + test.error.message;

			issueCommand(
				'error',
				{
					file: filePath,
					line: error.line,
					col: error.column
				},
				message
			);
		} );
	} else {
		resultObject.pass.forEach( ( test ) => {
			core.info( 'OK: ' + test.fullTitle );
		} );

		resultObject.skip.forEach( ( test ) => {
			core.warning( 'SKIP: ' + test.fullTitle );
		} );

		core.info( '\u001b[1mAll good 👍' );
	}
} else {
	core.error( 'No tests executed!' );
}
