import { SpawnSyncReturns, spawnSync } from 'child_process';

// https://regex101.com/r/eK9lPd/3
// eslint-disable-next-line security/detect-unsafe-regex
export const dockerImageUrlRegExp = /^(?<Name>(?<=^)(?:(?<Domain>(?:(?:localhost|[\w-]+(?:\.[\w-]+)+)(?::\d+)?)|[\w]+:\d+)\/)?\/?(?<Namespace>(?:(?:[a-z0-9]+(?:(?:[._]|__|[-]*)[a-z0-9]+)*)\/)*)(?<Repo>[a-z0-9-]+))[:@]?(?<Reference>(?<=:)(?<Tag>[\w][\w.-]{0,127})|(?<=@)(?<Digest>[A-Za-z][A-Za-z0-9]*(?:[-_+.][A-Za-z][A-Za-z0-9]*)*[:][0-9A-Fa-f]{32,}))?/;

export const loadLocalDockerImage = (
	dockerImageUrl: string,
	reload: boolean = false
): SpawnSyncReturns<string> => {
	try {
		const dockerImageUrlMatch = dockerImageUrlRegExp.exec( dockerImageUrl );

		if ( dockerImageUrlMatch.groups.Repo ) {
			const { stdout: alreadyLoaded } = spawnSync( 'docker',
				[ 'images', '-q', dockerImageUrl ], { encoding: 'utf-8' } );

			if ( !alreadyLoaded || reload ) {
				const imageName = dockerImageUrlMatch.groups.Repo;
				const result = spawnSync( 'docker', [ 'load', '-i', `../artifacts/${imageName}.docker.tar.gz` ],
					{ stdio: 'pipe', encoding: 'utf8', shell: true } );

				if ( result.status === 1 ) {
					throw result.stderr;
				}

				testEnv.testLog.debug( result );
				return result;
			}
		}
	} catch ( e ) {
		throw new Error( e );
	}
};

export default loadLocalDockerImage;
