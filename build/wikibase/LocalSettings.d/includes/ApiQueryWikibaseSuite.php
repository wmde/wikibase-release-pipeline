<?php

use MediaWiki\Api\ApiQuery;
use MediaWiki\Api\ApiQueryBase;
use Wikimedia\ParamValidator\ParamValidator;

class ApiQueryWikibaseSuite extends ApiQueryBase {
	public function __construct( ApiQuery $queryModule, $moduleName ) {
		parent::__construct( $queryModule, $moduleName, 'wbs' );
	}

	public function execute() {
		$params = $this->extractRequestParams();
		$props = $params['prop'] ?? [ 'versions' ];
		if ( !is_array( $props ) ) {
			$props = [ (string)$props ];
		}

		$data = [];

		if ( in_array( 'versions', $props, true ) ) {
			$data['versions'] = [
				'wikibase_image_version' => $this->getVersionValue( 'WIKIBASE_IMAGE_VERSION' ),
				'deploy_version' => $this->getVersionValue( 'DEPLOY_VERSION' ),
				'build_tools_git_sha' => $this->getVersionValue( 'BUILD_TOOLS_GIT_SHA' ),
			];
		}

		$this->getResult()->addValue( 'query', $this->getModuleName(), $data );
	}

	public function getAllowedParams() {
		return [
			'prop' => [
				ParamValidator::PARAM_TYPE => [ 'versions' ],
				ParamValidator::PARAM_ISMULTI => true,
				ParamValidator::PARAM_DEFAULT => 'versions',
			],
		];
	}

	private function getVersionValue( string $envVar ): string {
		$value = getenv( $envVar );
		if ( $value === false ) {
			return 'unknown';
		}

		$value = trim( (string)$value );
		if ( $value === '' ) {
			return 'unknown';
		}

		return $value;
	}
}
