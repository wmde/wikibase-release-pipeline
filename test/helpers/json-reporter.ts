import { existsSync, readFileSync, writeFileSync } from 'fs';
import reporter, { SuiteStats, TestStats } from '@wdio/reporter';
import { Reporters } from "@wdio/types";
import { ResultType, TestResult } from './types/test-results.js';

class JsonReporter extends reporter {
	resultFilePath: string | URL;
	failedTests: TestResult[];
	successfulTests: TestResult[];
	skippedTests: TestResult[];

	constructor( options : Partial<Reporters.Options>) {
		// make reporter to write to the output stream by default
		options = Object.assign( options, { stdout: true } );
		super( options );

		this.resultFilePath = options.resultFilePath;
		this.suites = {};
		this.failedTests = [];
		this.successfulTests = [];
		this.skippedTests = [];
	}

	onTestSkip( test: TestStats ) {
		this.skippedTests.push( { ...test } );
	}

	onTestPass( test: TestStats ) {
		this.successfulTests.push( { ...test } );
	}

	onTestFail( test: TestStats ) {
		this.failedTests.push( { ...test } );
	}

	onSuiteEnd( suiteStats: SuiteStats ) {
		const suite = process.env.SUITE;

		const result: ResultType = {
			[ suite ]: {
				fail: this.failedTests,
				pass: this.successfulTests,
				skip: this.skippedTests
			}
		};

		if ( existsSync( this.resultFilePath ) ) {
			const existing: ResultType = JSON.parse( readFileSync( this.resultFilePath, 'utf8' ) );

			result.start = suiteStats.start;

			if ( existing ) {
				result.start = existing.start ? existing.start : result.start;
				result[ suite ].pass = [ ...result[ suite ].pass, ...existing[ suite ].pass ];
				result[ suite ].fail = [ ...result[ suite ].fail, ...existing[ suite ].fail ];
				result[ suite ].skip = [ ...result[ suite ].skip, ...existing[ suite ].skip ];
			}
		}

		writeFileSync(
			this.resultFilePath,
			JSON.stringify( result, null, 2 ),
			'utf-8'
		);
	}
}

export default JsonReporter;
