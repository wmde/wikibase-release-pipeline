import { spawnSync } from 'child_process'

const loadLocalDockerImage = (
  imageName: string,
  reload: boolean = false
): void => {
  const result = spawnSync('docker', [ 'images', '-q', imageName ], { encoding: 'utf-8' });

  if ( !result.stdout || reload ) {
    // eslint-disable-next-line security/detect-child-process
    spawnSync( 'docker', [ 'load', '-i', `artifacts/${imageName}.docker.tar.gz` ], {
      stdio: 'inherit',
      shell: true
    } );
  }
};

export default loadLocalDockerImage;
