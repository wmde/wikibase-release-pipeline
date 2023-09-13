'use strict';

const assert = require( 'assert' );
const fsPromises = require( 'fs/promises' );
const defaultFunctions = require( '../../../helpers/default-functions' );
const readFileEncoding = require( '../../../helpers/readFileEncoding' );

describe( 'Scribunto', function () {
	it( 'Should be able to execute lua module', async () => {
		defaultFunctions.skipIfExtensionNotPresent( this, 'Scribunto' );

		const fileContents = await fsPromises.readFile(
			__dirname + '/bananas.lua',
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
