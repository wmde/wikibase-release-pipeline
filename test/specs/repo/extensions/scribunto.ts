import assert from 'assert';
import { readFile } from 'fs/promises';
import { skipIfExtensionNotPresent } from '../../../helpers/default-functions.js';
import { utf8 } from '../../../helpers/read-file-encoding.js';

describe( 'Scribunto', function () {
	beforeEach( async function () {
		await skipIfExtensionNotPresent( this, 'Scribunto' );
	} );

	it( 'Should be able to execute lua module', async () => {
		// eslint-disable-next-line security/detect-non-literal-fs-filename
		const fileContents = await readFile( new URL( 'bananas.lua', import.meta.url ), utf8 );
		await browser.editPage(
			process.env.MW_SERVER,
			'Module:Bananas',
			fileContents
		);

		const executionContent = await browser.editPage(
			process.env.MW_SERVER,
			'LuaTest',
			'{{#invoke:Bananas|hello}}'
		);

		// should come from executed lua script
		assert( executionContent.includes( 'Hello, world!' ) );
	} );

	it( 'Should be able to execute lua module within 0.05 seconds', async () => {
		const cpuTime = await browser.getLuaCpuTime(
			process.env.MW_SERVER,
			'LuaTest'
		);

		assert( cpuTime.value < 0.05 );
		assert.strictEqual( cpuTime.scale, 'seconds' );
	} );
} );
