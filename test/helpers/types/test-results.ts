export type TestResult = {
	fullTitle: string;
	error? : Error
};

export type ResultType = {
    [x: string]: {
        fail: TestResult[];
        pass: TestResult[];
        skip: TestResult[];
    };
    start?: any;
};
