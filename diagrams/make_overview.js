'use strict';

const fs = require( 'fs' );
const yaml = require( 'js-yaml' );
const _ = require( 'lodash' );

const p = function ( from, to ) {

	if ( from && to ) {
		console.log( from + ' ==> ' + to );
	}
};

const pDash = function ( from, to, path ) {

	if ( from && to ) {
		if ( path ) {
			path = path.replace( 'artifacts/', '' ).replace( './', '' );
			path = '|' + path + '|';
		}
		console.log( from + '-...-> ' + path + ' ' + to + '[(' + to + ')]' );
	}
};
try {
	const uploadAction = 'actions/upload-artifact@v2';
	const filename = '../.github/workflows/built_and_test.yml';
	const fileContents = fs.readFileSync( filename, 'utf8' );
	const data = yaml.load( fileContents );

	const artifacts = [];
	const startNodes = {};

	_.forEach( data.jobs, function ( job, name ) {

		_.forEach( job.steps, ( step ) => {
			if ( step.uses === uploadAction ) {
				if ( step.with.path ) {

					if ( !artifacts[ step.with.name ] ) {
						artifacts[ step.with.name ] = [];
					}

					artifacts[ step.with.name ].push( step.with.path );
					pDash( name, step.with.name, step.with.path );

				}

			}
		} );

		if ( job.needs ) {
			_.forEach( job.needs, ( need ) => {
				p( need, name );
			} );
		} else {
			startNodes[ name ] = job;
		}
	} );

	_.forEach( startNodes, function ( startNode, startName ) {
		p( 'PipelineTriggered(' + data.name + ')', startName );
	} );

} catch ( e ) {
	console.log( e );
}
