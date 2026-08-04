import chalk from 'chalk';

export function printSuiteHeading( suiteName: string ): void {
	console.log(
		chalk.bgWhiteBright.black.bold(
			`\n"${ suiteName }" test suite ${ ' '.repeat( Math.max( 1, 96 - suiteName.length ) ) }`
		)
	);
}
