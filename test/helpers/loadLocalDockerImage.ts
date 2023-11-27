import { spawnSync } from 'child_process';

export const loadLocalDockerImage = (
	providedImageName: string,
	reload: boolean = false
): void => {
	const imageName = providedImageName.replace( ':latest', '' );
	const result = spawnSync( 'docker', [ 'images', '-q', imageName ], { encoding: 'utf-8' } );

	if ( !result.stdout || reload ) {
		spawnSync( 'docker', [ 'load', '-i', `../artifacts/${imageName}.docker.tar.gz` ], {
			stdio: 'inherit',
			shell: true
		} );
	}
};

export default loadLocalDockerImage;
