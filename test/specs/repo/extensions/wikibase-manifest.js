import assert from 'assert';
import { skipIfExtensionNotPresent } from '../../../helpers/default-functions.js';

describe( 'WikibaseManifest', function () {
	it( 'Should have rest endpoint and data', async () => {
		skipIfExtensionNotPresent( this, 'WikibaseManifest' );

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
