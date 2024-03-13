export class Page {
	public async open( path: string ): Promise<void> {
		await browser.url( `${ testEnv.vars.WIKIBASE_URL }${ path }` );
	}
}

export default new Page();
