import assert from 'assert';
import { spawnSync } from 'child_process';
import { getTestString } from 'wdio-mediawiki/Util.js';
import WikibaseApi from 'wdio-wikibase/wikibase.api.js';
import ItemPage from '../../helpers/pages/entity/item.page.js';
import { versions } from '../../suites/upgrade/versions.js';

describe( 'Wikibase upgrade', function () {
	let oldItemID: string;

	before( async () => {
		// === Set image for current local build of wikibase
		testEnv.vars.WIKIBASE_UPGRADE_TEST_IMAGE_URL =
			versions[ process.env.TO_VERSION ];
		console.log(
			`ℹ️  Upgrading TO Wikibase Docker image: ${testEnv.vars.WIKIBASE_UPGRADE_TEST_IMAGE_URL}`
		);

		// === Fix for LocalSettings.php (see notes in the script)
		spawnSync( 'specs/upgrade/recreateLocalSettings.sh', {
			shell: true,
			stdio: 'inherit',
			env: { ...testEnv.vars, PATH: process.env.PATH }
		} );

		// === Take down and start with new wikibase version (without removing data / volumes)
		await testEnv.runDockerComposeCmd( '--progress quiet down' );
		await testEnv.runDockerComposeCmd(
			'-f suites/upgrade/docker-compose.override.yml --progress quiet up -d --wait'
		);
		await testEnv.waitForServices();

		// === Run "php /var/www/html/maintenance/update.php" on the wikibase service
		await testEnv.runDockerComposeCmd(
			'exec wikibase php /var/www/html/maintenance/update.php --quick'
		);
		// Make sure services are settled and available again
		await testEnv.waitForServices();
		// Repeat WDIO initialization with new services up
		await testEnv.settings.before();
	} );

	it( 'Should be able to create many properties and items', async () => {
		const numEntities = 100;
		for ( let i = 0; i < numEntities; i++ ) {
			const itemLabel = 'T267743-';
			const propertyValue = 'PropertyExampleStringValue';
			const propertyId = await WikibaseApi.createProperty( 'string' );
			const data = {
				claims: [
					{
						mainsnak: {
							snaktype: 'value',
							property: propertyId,
							datavalue: { value: propertyValue, type: 'string' }
						},
						type: 'statement',
						rank: 'normal'
					}
				]
			};

			const itemId = await WikibaseApi.createItem(
				getTestString( itemLabel ),
				data
			);
			assert.strictEqual( itemId.startsWith( 'Q' ), true );
			assert.strictEqual( propertyId.startsWith( 'P' ), true );
		}
	} );

	it( 'Should be able find the item after upgrade', async () => {
		const result = await browser.makeRequest(
			`${testEnv.vars.WIKIBASE_URL}/w/api.php?action=wbsearchentities&search=UpgradeItem&format=json&language=en&type=item`
		);
		const success = result.data.success;
		const searchResults = result.data.search;

		assert.strictEqual( success, 1 );
		assert.strictEqual( searchResults.length, 1 );
		assert.strictEqual( searchResults[ 0 ].match.text, 'UpgradeItem' );
		assert.strictEqual( searchResults[ 0 ].match.type, 'label' );

		oldItemID = searchResults[ 0 ].id;

		await ItemPage.open( oldItemID );
	} );

	it( 'should show up in Special:EntityData with json', async () => {
		const response = await browser.makeRequest(
			`${testEnv.vars.WIKIBASE_URL}/wiki/Special:EntityData/${oldItemID}.json`
		);
		const body = response.data;

		assert( body.entities[ oldItemID ].claims[ 0 ] !== null );
	} );
} );
