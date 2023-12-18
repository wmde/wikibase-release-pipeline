export class Page {
	public async open( path: string ): Promise<void> {
		await browser.url( `${process.env.MW_SERVER}${path}` );
	}
}

export default new Page();
