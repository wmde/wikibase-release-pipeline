import envVars from '../../setup/envVars.js';

class Page {
	public async open( path: string ): Promise<void> {
		await browser.url( `${envVars.WDQS_FRONTEND_URL}${path}` );
	}
}

export default Page;
