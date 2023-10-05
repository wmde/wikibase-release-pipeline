import fs from 'fs';
import reporter from '@wdio/reporter';

class JsonReporter extends reporter {
	constructor( options ) {
		// make reporter to write to the output stream by default
		options = Object.assign( options, { stdout: true } );
		super( options );

		this.resultFilePath = options.resultFilePath;
		this.suite = {};
		this.failures = [];
		this.success = [];
		this.skipped = [];
	}

	onTestSkip( test ) {
		this.skipped.push( {
			fullTitle: test.fullTitle
		} );
	}

	onTestPass( test ) {
		this.success.push( {
			fullTitle: test.fullTitle
		} );
	}

	onTestFail( test ) {
		this.failures.push( {
			fullTitle: test.fullTitle,
			error: test.error
		} );
	}

	onSuiteEnd( suiteStats ) {
		const suite = process.env.SUITE;
		const result = {
			[ suite ]: {
				fail: this.failures,
				pass: this.success,
				skip: this.skipped
			}
		};

		if ( fs.existsSync( this.resultFilePath ) ) {
			const existing = JSON.parse( fs.readFileSync( this.resultFilePath, 'utf8' ) );

			result.start = suiteStats.start;

			if ( existing ) {
				result.start = existing.start ? existing.start : result.start;
				result[ suite ].pass = result[ suite ].pass.concat( existing[ suite ].pass );
				result[ suite ].fail = result[ suite ].fail.concat( existing[ suite ].fail );
				result[ suite ].skip = result[ suite ].skip.concat( existing[ suite ].skip );
			}
		}

		fs.writeFileSync(
			this.resultFilePath,
			JSON.stringify( result, null, 2 ),
			'utf-8'
		);
	}
}

export default JsonReporter;
