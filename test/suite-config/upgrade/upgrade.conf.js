'use strict';

exports.config = {
	suite: {
		// eslint-disable-next-line camelcase
		pre_upgrade: [
			'./specs/repo/api.js',
			'./specs/upgrade/pre-upgrade.js',
			'./specs/upgrade/queryservice-pre-and-post-upgrade.js'
		],

		// eslint-disable-next-line camelcase
		post_upgrade: [
			'./specs/repo/api.js',
			'./specs/upgrade/post-upgrade.js',
			'./specs/upgrade/queryservice-pre-and-post-upgrade.js',
			'./specs/upgrade/queryservice-post-upgrade.js'
		]
	}
};
