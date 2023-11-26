import { spawnSync } from 'child_process';
import assert from 'assert';
import WikibaseApi from 'wdio-wikibase/wikibase.api.js';
import { testSetup } from '../../suites/upgrade/upgrade.conf.js';
import loadLocalDockerImage from '../../helpers/loadLocalDockerImage.js';
import { defaultFunctions as defaultFunctionsInit } from '../../helpers/default-functions.js';
import { getTestString } from 'wdio-mediawiki/Util.js';

describe( 'Wikibase post upgrade', function () {
	let oldItemID: string;

	before( async () => {
		process.env.TEST_COMPOSE = testSetup.baseDockerComposeCmd;

		// Set new version and load the docker image (assumed local)
		process.env.WIKIBASE_TEST_IMAGE_NAME = `${testSetup.isBaseSuite ? 'wikibase' : 'wikibase-bundle'}:latest`;
		loadLocalDockerImage( process.env.WIKIBASE_TEST_IMAGE_NAME );

		spawnSync(
			'specs/upgrade/setup.sh',
			{ shell: true, stdio: 'inherit', env: process.env }
		);

		// Wait for services to restart after they were cycled at the end of setup.sh above
		// TODO: consider moving that out of shell script and use testSetup.stopServices() and
		// startServices()  or a new testSetup.resetServices() instead
		await testSetup.waitForServices();

		// Run "php /var/www/html/maintenance/update.php" on wikibase-service
		//  TODO: consider adding a "testSetup.dockerExec( optionsAndCmd: string )" method
		spawnSync(
			'$TEST_COMPOSE exec wikibase php /var/www/html/maintenance/update.php --quick',
			{ shell: true, stdio: 'inherit', env: process.env }
		);

		// Make sure services are settled and available again
		await testSetup.waitForServices();

		// Repeat WDIO before initialization for the new wikibase instance
		// TODO: consider integrating this logic as part of a testSetup.resetServices() method?
		defaultFunctionsInit();
		await WikibaseApi.initialize(
			undefined,
			process.env.MW_ADMIN_NAME,
			process.env.MW_ADMIN_PASS
		);
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
			`${process.env.MW_SERVER}/w/api.php?action=wbsearchentities&search=UpgradeItem&format=json&language=en&type=item`
		);
		const success = result.data.success;
		const searchResults = result.data.search;

		assert.strictEqual( success, 1 );
		assert.strictEqual( searchResults.length, 1 );
		assert.strictEqual( searchResults[ 0 ].match.text, 'UpgradeItem' );
		assert.strictEqual( searchResults[ 0 ].match.type, 'label' );

		oldItemID = searchResults[ 0 ].id;

		await browser.url( `${process.env.MW_SERVER}/wiki/Item:${oldItemID}` );
	} );

	it( 'should show up in Special:EntityData with json', async () => {
		const response = await browser.makeRequest(
			`${process.env.MW_SERVER}/wiki/Special:EntityData/${oldItemID}.json`
		);
		const body = response.data;

		assert( body.entities[ oldItemID ].claims[ 0 ] !== null );
	} );
} );
