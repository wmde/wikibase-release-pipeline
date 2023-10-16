type WaitForOptions = {
	timeout?: number;
};

const awaitDisplayed = async (
	identifier: string,
	options?: WaitForOptions
): Promise<ChainablePromiseElement> => {
	const resultElement = await $( identifier );
	await resultElement.waitForDisplayed( options );
	return resultElement;
};

export default awaitDisplayed;
