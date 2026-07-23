import { createRequire } from 'module';
import page from '../../../helpers/pages/page.js';

type WikibaseSuiteVersions = {
	wikibaseImageVersion: string;
	deployVersion: string;
	buildToolsGitSha: string;
};

type WikibaseSuitePublicMetrics = {
	wikimediaLinkedUserCount?: number;
};

type DockerComposeConfig = {
	services?: {
		wikibase?: {
			environment?: Record<string, string> | string[];
		};
	};
};

const getInstalledSoftwareVersionForProduct = async (
	productName: string
): Promise<string> =>
	$(
		`//*[@id="sv-software"]//tr[td and contains(normalize-space(string(td[1])),"${ productName }")]/td[2]`
	).getText();

const normalizeVersionValue = ( value: string ): string => value.trim();
const getVersionOrEmpty = (
	source: Record<string, string>,
	key: string
): string => source[ key ] ?? '';
const require = createRequire( import.meta.url );
const getDeployPackageVersion = (): string => {
	const deployPackageJson = require( '../../../../deploy/package.json' ) as {
		version?: string;
	};

	return deployPackageJson.version ?? '';
};
const getDeployVersionFromComposeWikibaseService =
	async (): Promise<string> => {
		const dockerComposeConfigOutput = await testEnv.runDockerComposeCmd(
			'config --format json'
		);
		const dockerComposeConfig = JSON.parse(
			dockerComposeConfigOutput
		) as DockerComposeConfig;
		const services = dockerComposeConfig.services || {};
		const wikibaseService = services.wikibase || {};
		const environment = wikibaseService.environment;

		if ( !environment ) {
			return '';
		}

		if ( Array.isArray( environment ) ) {
			const deployVersionEntry = environment.find( ( entry ) =>
				entry.startsWith( 'DEPLOY_VERSION=' )
			);

			return deployVersionEntry ?
				deployVersionEntry.split( '=' )[ 1 ] :
				'';
		}

		return environment.DEPLOY_VERSION || '';
	};

const getRuntimeVersionsFromWikibaseContainer =
	async (): Promise<WikibaseSuiteVersions> => {
		const runtimeOutput = await testEnv.runDockerComposeCmd(
			'exec -T wikibase sh -lc \'printf "wikibaseImageVersion=%s\\n" "$WIKIBASE_IMAGE_VERSION"; printf "deployVersion=%s\\n" "$DEPLOY_VERSION"; printf "buildToolsGitSha=%s\\n" "$BUILD_TOOLS_GIT_SHA"\''
		);
		const runtimeEntries = runtimeOutput
			.trim()
			.split( '\n' )
			.reduce( ( entries, line ) => {
				const [ key, ...rest ] = line.split( '=' );
				entries[ key ] = rest.join( '=' );
				return entries;
			}, {} as Record<string, string> );

		return {
			wikibaseImageVersion:
				runtimeEntries.wikibaseImageVersion ?? '',
			deployVersion: runtimeEntries.deployVersion ?? '',
			buildToolsGitSha:
				runtimeEntries.buildToolsGitSha ?? ''
		};
	};

const getWikibaseSuiteApiVersions =
	async (): Promise<WikibaseSuiteVersions> => {
		const result = await browser.makeRequest(
			testEnv.vars.WIKIBASE_URL + '/w/api.php?action=query&meta=wikibasesuite&wbsprop=versions&format=json'
		);

		const apiVersions = result.data.query.wikibasesuite.versions;
		return {
			wikibaseImageVersion:
				getVersionOrEmpty( apiVersions, 'wikibase_image_version' ),
			deployVersion: getVersionOrEmpty( apiVersions, 'deploy_version' ),
			buildToolsGitSha: getVersionOrEmpty( apiVersions, 'build_tools_git_sha' )
		};
	};

const getWikibaseSuiteApiPublicMetrics =
	async (): Promise<WikibaseSuitePublicMetrics> => {
		const result = await browser.makeRequest(
			testEnv.vars.WIKIBASE_URL + '/w/api.php?action=query&meta=wikibasesuite&wbsprop=publicmetrics&format=json'
		);

		expect( result.data.error ).toBeUndefined();
		const apiMetrics = result.data.query.wikibasesuite.publicmetrics;
		return {
			wikimediaLinkedUserCount: apiMetrics.wikimedia_linked_user_count
		};
	};

describe( 'Wikibase Suite extension', function () {
	let runtimeVersions: WikibaseSuiteVersions;
	let composeDeployVersion: string;

	before( async function () {
		runtimeVersions = await getRuntimeVersionsFromWikibaseContainer();
		composeDeployVersion = await getDeployVersionFromComposeWikibaseService();
	} );

	it( 'Should expose suite versions through action API', async function () {
		const versions = await getWikibaseSuiteApiVersions();

		expect( normalizeVersionValue( versions.wikibaseImageVersion ) ).toEqual(
			normalizeVersionValue( runtimeVersions.wikibaseImageVersion )
		);
		expect( normalizeVersionValue( versions.deployVersion ) ).toEqual(
			normalizeVersionValue( runtimeVersions.deployVersion )
		);
		expect(
			normalizeVersionValue( versions.buildToolsGitSha ).toLowerCase()
		).toEqual(
			normalizeVersionValue( runtimeVersions.buildToolsGitSha ).toLowerCase()
		);
	} );

	it( 'Should include suite versions on Special:Version', async function () {
		await page.open( '/wiki/Special:Version' );
		const dockerImageVersion = await getInstalledSoftwareVersionForProduct(
			'Wikibase Suite Docker Image'
		);
		expect( normalizeVersionValue( dockerImageVersion ) ).toEqual(
			normalizeVersionValue( runtimeVersions.wikibaseImageVersion )
		);

		const buildToolsVersion = await getInstalledSoftwareVersionForProduct(
			'Wikibase Suite Build Tools'
		);
		expect( normalizeVersionValue( buildToolsVersion ).toLowerCase() ).toEqual(
			normalizeVersionValue( runtimeVersions.buildToolsGitSha ).toLowerCase()
		);

		const deployValue = await getInstalledSoftwareVersionForProduct(
			'Wikibase Suite Deploy'
		);
		expect( normalizeVersionValue( deployValue ) ).toEqual(
			normalizeVersionValue( runtimeVersions.deployVersion )
		);
	} );

	it( 'Should be listed on Special:Version with its extension version', async function () {
		await page.open( '/wiki/Special:Version' );
		const extensionInfo = await $( '#mw-version-ext-other-WikibaseSuite' ).getText();
		await expect( extensionInfo ).toMatch( /Wikibase Suite.*1\.0\.0/ );
	} );

	it( 'Should expose Wikimedia linked user count through public metrics', async function () {
		const metrics = await getWikibaseSuiteApiPublicMetrics();

		expect( metrics.wikimediaLinkedUserCount ).toEqual( 0 );
	} );

	it( 'Should keep deploy package version in sync with DEPLOY_VERSION in wikibase compose service', function () {
		const deployPackageVersion = getDeployPackageVersion();
		expect( normalizeVersionValue( composeDeployVersion ) ).toEqual(
			normalizeVersionValue( deployPackageVersion )
		);
	} );
} );
