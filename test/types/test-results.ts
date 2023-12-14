export type TestResult = {
	fullTitle: string;
	error?: Error;
};

export type ResultType = {
	[x: string]: {
		fail: TestResult[];
		pass: TestResult[];
		skip: TestResult[];
	};
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	start?: any;
};
