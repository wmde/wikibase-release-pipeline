'use strict';

exports.config = {
	suite: [
		'./specs/repo/api.js',
		'./specs/upgrade/pre-upgrade.js',
		'./specs/upgrade/queryservice-pre-and-post-upgrade.js'
	]
};
