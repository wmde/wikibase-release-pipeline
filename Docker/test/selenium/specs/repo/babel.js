'use strict';

const assert = require( 'assert' );
const defaultFunctions = require( '../../helpers/default-functions' );
const LoginPage = require( 'wdio-mediawiki/LoginPage' );

describe( 'Babel', function () {

	before( function () {
		defaultFunctions();
	} );

	it( 'Should be able to update the user page with language skills', function () {

		LoginPage.loginAdmin();

		const executionContent = browser.editPage(
			process.env.MW_SERVER,
			'User:' + process.env.MW_ADMIN_NAME,
			'{{#babel: sv | en }}'
		);

		assert( executionContent.includes( 'Den här användaren har svenska som modersmål.' ) === true );
		assert( executionContent.includes( 'This user has a native understanding of English.' ) === true );

	} );
} );
