import { readFileSync } from 'fs';
import yaml from 'js-yaml';
import lodash from 'lodash';

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
	const filename = '../../.github/workflows/build_and_test.yml';
	const fileContents = readFileSync( filename, 'utf8' );
	const data = yaml.load( fileContents );

	const artifacts = [];
	const startNodes = {};

	lodash.forEach( data.jobs, function ( job, name ) {

		lodash.forEach( job.steps, ( step ) => {
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
			lodash.forEach( job.needs, ( need ) => {
				p( need, name );
			} );
		} else {
			startNodes[ name ] = job;
		}
	} );

	lodash.forEach( startNodes, function ( startNode, startName ) {
		p( 'PipelineTriggered(' + data.name + ')', startName );
	} );

} catch ( e ) {
	console.log( e );
}
