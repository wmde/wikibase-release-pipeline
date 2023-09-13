import Page from '../page';

class Property extends Page {

	get save() { return $( '=save' ); }
	get addStatement() { return $( '=add statement' ); }
	get addReference() { return $( '=add reference' ); }

	async open( id ) {
		await browser.url( process.env.MW_SERVER + '/wiki/Property:' + id );
	}
}

export default new Property();
