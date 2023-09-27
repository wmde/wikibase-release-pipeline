import assert from 'assert';
import fsPromises from 'fs/promises';
import defaultFunctions from '../../../helpers/default-functions';
import readFileEncoding from '../../../helpers/readFileEncoding';

describe( 'Scribunto', function () {
	it( 'Should be able to execute lua module', async () => {
		defaultFunctions.skipIfExtensionNotPresent( this, 'Scribunto' );

		const fileContents = await fsPromises.readFile(
			new URL( 'bananas.lua', import.meta.url ),
			readFileEncoding.utf8
		);
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
		defaultFunctions.skipIfExtensionNotPresent( this, 'Scribunto' );

		const cpuTime = await browser.getLuaCpuTime(
			process.env.MW_SERVER,
			'LuaTest'
		);

		assert( cpuTime.value < 0.05 );
		assert.strictEqual( cpuTime.scale, 'seconds' );
	} );
} );
