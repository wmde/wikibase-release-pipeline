import page from '../../helpers/pages/page.js';

type WikibaseSuiteApiVersions = {
	wikibase_image_version: string;
	deploy_version: string;
	build_tools_git_sha: string;
};

const getInstalledSoftwareVersionForProduct = async (
	productName: string
): Promise<string> =>
	$(
		`//*[@id="sv-software"]//tr[td and contains(normalize-space(string(td[1])),"${ productName }")]/td[2]`
	).getText();

const normalizeVersionValue = ( value: string ): string => value.trim();

const getRuntimeVersionsFromWikibaseContainer =
	async (): Promise<WikibaseSuiteApiVersions> => {
		const runtimeOutput = await testEnv.runDockerComposeCmd(
			'exec -T wikibase sh -lc \'printf "wikibase_image_version=%s\\n" "$WIKIBASE_IMAGE_VERSION"; printf "deploy_version=%s\\n" "$DEPLOY_VERSION"; printf "build_tools_git_sha=%s\\n" "$BUILD_TOOLS_GIT_SHA"\''
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
			wikibase_image_version:
				runtimeEntries.wikibase_image_version ?? '',
			deploy_version: runtimeEntries.deploy_version ?? '',
			build_tools_git_sha:
				runtimeEntries.build_tools_git_sha ?? ''
		};
	};

const getWikibaseSuiteApiVersions =
	async (): Promise<WikibaseSuiteApiVersions> => {
		const result = await browser.makeRequest(
			testEnv.vars.WIKIBASE_URL + '/w/api.php?action=query&meta=wikibasesuite&wbsprop=versions&format=json'
		);

		return result.data.query.wikibasesuite.versions;
	};

describe( 'Wikibase Suite version reporting', function () {
	let runtimeVersions: WikibaseSuiteApiVersions;

	before( async function () {
		runtimeVersions = await getRuntimeVersionsFromWikibaseContainer();
	} );

	it( 'Should expose suite versions through action API', async function () {
		const versions = await getWikibaseSuiteApiVersions();

		expect( normalizeVersionValue( versions.wikibase_image_version ) ).toEqual(
			normalizeVersionValue( runtimeVersions.wikibase_image_version )
		);
		expect( normalizeVersionValue( versions.deploy_version ) ).toEqual(
			normalizeVersionValue( runtimeVersions.deploy_version )
		);
		expect(
			normalizeVersionValue( versions.build_tools_git_sha ).toLowerCase()
		).toEqual(
			normalizeVersionValue( runtimeVersions.build_tools_git_sha ).toLowerCase()
		);
	} );

	it( 'Should include suite versions on Special:Version', async function () {
		await page.open( '/wiki/Special:Version' );
		const dockerImageVersion = await getInstalledSoftwareVersionForProduct(
			'Wikibase Suite Docker Image'
		);
		expect( normalizeVersionValue( dockerImageVersion ) ).toEqual(
			normalizeVersionValue( runtimeVersions.wikibase_image_version )
		);

		const buildToolsVersion = await getInstalledSoftwareVersionForProduct(
			'Wikibase Suite Build Tools'
		);
		expect( normalizeVersionValue( buildToolsVersion ).toLowerCase() ).toEqual(
			normalizeVersionValue( runtimeVersions.build_tools_git_sha ).toLowerCase()
		);

		const deployValue = await getInstalledSoftwareVersionForProduct(
			'Wikibase Suite Deploy'
		);
		expect( normalizeVersionValue( deployValue ) ).toEqual(
			normalizeVersionValue( runtimeVersions.deploy_version )
		);
	} );
} );
