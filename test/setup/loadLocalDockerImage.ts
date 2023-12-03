import { spawnSync } from 'child_process';

// https://regex101.com/r/eK9lPd/3
export const dockerImageUrlRegExp = new RegExp(
	/^(?<Name>(?<=^)(?:(?<Domain>(?:(?:localhost|[\w-]+(?:\.[\w-]+)+)(?::\d+)?)|[\w]+:\d+)\/)?\/?(?<Namespace>(?:(?:[a-z0-9]+(?:(?:[._]|__|[-]*)[a-z0-9]+)*)\/)*)(?<Repo>[a-z0-9-]+))[:@]?(?<Reference>(?<=:)(?<Tag>[\w][\w.-]{0,127})|(?<=@)(?<Digest>[A-Za-z][A-Za-z0-9]*(?:[-_+.][A-Za-z][A-Za-z0-9]*)*[:][0-9A-Fa-f]{32,}))?/g
);

export const loadLocalDockerImage = (
	dockerImageURL: string,
	reload: boolean = false
): void => {
	// TODO: Improve error handling:
	// * If there is not local image to load it will fail without good feedback. This can be due
	// to no current build available, and the test run should stop and deliver this message and/or
	// provide an option to start a build at this point.
	// * Currently this will get the name of the image to load from a Docker URL. Currently it will
	// attempt to load a local <imageName>.tar.gz for ANY Docker URL including ones with a base
	// registry (e.g docker.io/<imageName>:version).
	const dockerImageUrlMatch = dockerImageUrlRegExp.exec(dockerImageURL);

	if ( dockerImageUrlMatch?.groups && dockerImageUrlMatch.groups.Repo ) {
		const imageName = dockerImageUrlMatch.groups.Repo;
		console.log( 'loading imageName', imageName );
		// const imageName = dockerImageURL.split( '/' ).reverse()[0].split(':').reverse().[0];
		const result = spawnSync( 'docker', [ 'images', '-q', imageName ], { encoding: 'utf-8' } );
		if ( !result.stdout || reload ) {
			spawnSync( 'docker', [ 'load', '-i', `../artifacts/${imageName}.docker.tar.gz` ], {
				stdio: 'inherit',
				shell: true
			} );
		}
	}
};

export default loadLocalDockerImage;
