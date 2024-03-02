import assert from 'assert';
import { readFile } from 'fs/promises';
import { utf8 } from '../../../helpers/readFileEncoding.js';

describe( 'Scribunto', function () {
	beforeEach( async function () {
		await browser.skipIfExtensionNotPresent( this, 'Scribunto' );
	} );

	it( 'Should be able to execute lua module', async function () {
		// eslint-disable-next-line security/detect-non-literal-fs-filename
		const fileContents = await readFile(
			new URL( 'bananas.lua', import.meta.url ),
			utf8
		);
		await browser.editPage(
			testEnv.vars.WIKIBASE_URL,
			'Module:Bananas',
			fileContents
		);

		const executionContent = await browser.editPage(
			testEnv.vars.WIKIBASE_URL,
			'LuaTest',
			'{{#invoke:Bananas|hello}}'
		);

		// should come from executed lua script
		assert( executionContent.includes( 'Hello, world!' ) );
	} );

	it( 'Should be able to execute lua module within 0.05 seconds', async function () {
		const cpuTime = await browser.getLuaCpuTime(
			testEnv.vars.WIKIBASE_URL,
			'LuaTest'
		);

		expect( cpuTime.value ).toBeLessThan( 0.05 );
		expect( cpuTime.scale ).toBe( 'seconds' );
	} );
} );
