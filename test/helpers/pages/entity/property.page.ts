import Page from '../page.js';

class Property extends Page {

	get save() { return $( '=save' ); }
	get addStatement() { return $( '=add statement' ); }
	get addReference() { return $( '=add reference' ); }

	async open( id: string ): Promise<void> {
		await browser.url( process.env.MW_SERVER + '/wiki/Property:' + id );
	}
}

export default new Property();
