type WaitForOptions = {
	timeout?: number;
};

const awaitDisplayed = async (
	identifier: string | ChainablePromiseElement | WebdriverIO.Element,
	options?: WaitForOptions
): Promise<WebdriverIO.Element> => {
	const resultElement =
		typeof identifier === 'string' ? await $( identifier ) : await identifier;
	await resultElement.waitForDisplayed( options );
	return resultElement;
};

export default awaitDisplayed;
