import { spawnSync } from 'child_process';

export const loadLocalDockerImage = (
	imageName: string,
	reload: boolean = false
): void => {
	const result = spawnSync( 'docker', [ 'images', '-q', imageName ], { encoding: 'utf-8' } );

	if ( !result.stdout || reload ) {
		spawnSync( 'docker', [ 'load', '-i', `../artifacts/${imageName}.docker.tar.gz` ], {
			stdio: 'inherit',
			shell: true
		} );
	}
};

export default loadLocalDockerImage;
