'use strict';

const fs = require( 'fs' );
const reporter = require( '@wdio/reporter' );

class JsonReporter extends reporter.default {

	constructor( options ) {
		// make reporter to write to the output stream by default
		options = Object.assign( options, { stdout: true } );
		super( options );

		this.resultFilePath = options.resultFilePath;
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
	onRunnerEnd() {
		const result = {
			fail: this.failures,
			pass: this.success,
			skip: this.skipped
		};

		if ( fs.existsSync( this.resultFilePath ) ) {
			const existing = JSON.parse( fs.readFileSync( this.resultFilePath, 'utf8' ) );

			if ( existing ) {
				result.pass = result.pass.concat( existing.pass );
				result.fail = result.fail.concat( existing.fail );
				result.skip = result.skip.concat( existing.skip );
			}
		}

		fs.writeFileSync( this.resultFilePath, JSON.stringify( result, null, 2 ), 'utf-8' );
	}
}

module.exports = JsonReporter;
