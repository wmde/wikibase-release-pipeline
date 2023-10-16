const awaitDisplayed = async (
	identifier: string
): Promise<ChainablePromiseElement> => {
	const resultElement = await $( identifier );
	await resultElement.waitForDisplayed();
	return resultElement;
};

export default awaitDisplayed;
