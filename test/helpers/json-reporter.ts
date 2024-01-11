import { existsSync, readFileSync, writeFileSync } from 'fs';
import WDIOReporter, { SuiteStats, TestStats } from '@wdio/reporter';
import { Reporters } from '@wdio/types';
import { ResultType, TestResult } from '../types/test-results.js';
import { utf8 } from './readFileEncoding.js';

type JsonReporterOptions = {
	suiteName: string;
	resultsFilePath: string;
};

class JsonReporter extends WDIOReporter {
	private failedTests: TestResult[];
	private successfulTests: TestResult[];
	private skippedTests: TestResult[];

	public constructor( options: Partial<Reporters.Options> & JsonReporterOptions ) {
		// make reporter to write to the output stream by default
		options = Object.assign( options, { stdout: true } );

		super( options );

		this.suites = {};
		this.failedTests = [];
		this.successfulTests = [];
		this.skippedTests = [];
	}

	public onTestSkip( test: TestStats ): void {
		this.skippedTests.push( { fullTitle: test.fullTitle } );
	}

	public onTestPass( { fullTitle, retries, error }: TestStats ): void {
		this.successfulTests.push( { fullTitle, retries, error } );
	}

	public onTestFail( { fullTitle, retries, error }: TestStats ): void {
		this.failedTests.push( { fullTitle, retries, error } );
	}

	public onSuiteEnd( suiteStats: SuiteStats ): void {
		const suite = this.options.suiteName;

		const result: ResultType = {
			[ suite ]: {
				fail: this.failedTests,
				pass: this.successfulTests,
				skip: this.skippedTests
			}
		};

		// eslint-disable-next-line security/detect-non-literal-fs-filename
		if ( existsSync( this.options.resultFilePath ) ) {
			const existing: ResultType = JSON.parse(
				// eslint-disable-next-line security/detect-non-literal-fs-filename
				readFileSync( this.options.resultFilePath, 'utf8' )
			);

			result.start = suiteStats.start;

			if ( existing ) {
				result.start = existing.start ? existing.start : result.start;
				result[ suite ].pass = [ ...result[ suite ].pass, ...existing[ suite ].pass ];
				result[ suite ].fail = [ ...result[ suite ].fail, ...existing[ suite ].fail ];
				result[ suite ].skip = [ ...result[ suite ].skip, ...existing[ suite ].skip ];
			}
		}

		// eslint-disable-next-line security/detect-non-literal-fs-filename
		writeFileSync(
			this.options.resultFilePath,
			JSON.stringify( result, null, 2 ),
			utf8.encoding
		);
	}
}

export default JsonReporter;
