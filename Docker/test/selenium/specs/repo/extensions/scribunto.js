'use strict';

const assert = require( 'assert' );
const fs = require( 'fs' );
const defaultFunctions = require( '../../../helpers/default-functions' );

describe( 'Scribunto', function () {

	it( 'Should be able to execute lua module', function () {

		defaultFunctions.skipIfExtensionNotPresent( this, 'Scribunto' );

		browser.editPage(
			process.env.MW_SERVER,
			'Module:Bananas',
			fs.readFileSync( 'data/bananas.lua', 'utf8' )
		);

		const executionContent = browser.editPage(
			process.env.MW_SERVER,
			'LuaTest',
			'{{#invoke:Bananas|hello}}'
		);

		// should come from executed lua script
		assert( executionContent.includes( 'Hello, world!' ) );
	} );

	it( 'Should be able to execute lua module within 0.05 seconds', function () {
		defaultFunctions.skipIfExtensionNotPresent( this, 'Scribunto' );

		const cpuTime = browser.getLuaCpuTime( process.env.MW_SERVER, 'LuaTest' );

		assert( cpuTime.value < 0.05 );
		assert.strictEqual( cpuTime.scale, 'seconds' );

	} );

} );
