import propertyIdSelector from '../../property-id-selector.js';

class StatementComponent {
	public get addReferenceLink(): ChainablePromiseElement {
		return $( '=add reference' );
	}
	public get addStatementLink(): ChainablePromiseElement {
		return $( '=add statement' );
	}
	public get saveStatementLink(): ChainablePromiseElement {
		// Only return save button if enabled
		return $( '.wikibase-toolbar-button-save[aria-disabled="false"]' ).$( '=save' );
	}

	public async selectProperty(
		propertyId: string,
		propertyLabel?: string
	): Promise<void> {
		await browser.keys( ( propertyLabel ?? propertyId ).split( '' ) );
		await propertyIdSelector( propertyId ).click();
	}
}

export default new StatementComponent();
