import assert from 'assert';
import { skipIfExtensionNotPresent } from '../../../helpers/default-functions.js';

describe( 'WikibaseManifest', function () {
	beforeEach( async function () {
		await skipIfExtensionNotPresent( this, 'WikibaseManifest' );
	} );

	it( 'Should have rest endpoint and data', async () => {
		const result = await browser.makeRequest(
			process.env.MW_SERVER + '/w/rest.php/wikibase-manifest/v0/manifest'
		);
		const data = result.data;

		assert.strictEqual( 'wikibase-docker', data.name );

		assert.strictEqual( process.env.MW_SERVER + '/w/api.php', data.api.action );
		assert.strictEqual( process.env.MW_SERVER + '/w/rest.php', data.api.rest );

		assert.strictEqual(
			process.env.MW_SERVER + '/wiki/Special:OAuthConsumerRegistration',
			data.oauth.registration_page
		);
	} );
} );
