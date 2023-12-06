import assert from 'assert';
import { readFile } from 'fs/promises';
import { skipIfExtensionNotPresent } from '../../../helpers/default-functions.js';
import { utf8 } from '../../../helpers/readFileEncoding.js';
import envVars from '../../../setup/envVars.js';

describe( 'Scribunto', function () {
	beforeEach( async function () {
		await skipIfExtensionNotPresent( this, 'Scribunto' );
	} );

	it( 'Should be able to execute lua module', async () => {
		// eslint-disable-next-line security/detect-non-literal-fs-filename
		const fileContents = await readFile( new URL( 'bananas.lua', import.meta.url ), utf8 );
		await browser.editPage(
			envVars.WIKIBASE_URL,
			'Module:Bananas',
			fileContents
		);

		const executionContent = await browser.editPage(
			envVars.WIKIBASE_URL,
			'LuaTest',
			'{{#invoke:Bananas|hello}}'
		);

		// should come from executed lua script
		assert( executionContent.includes( 'Hello, world!' ) );
	} );

	it( 'Should be able to execute lua module within 0.05 seconds', async () => {
		const cpuTime = await browser.getLuaCpuTime(
			envVars.WIKIBASE_URL,
			'LuaTest'
		);

		assert( cpuTime.value < 0.05 );
		assert.strictEqual( cpuTime.scale, 'seconds' );
	} );
} );
