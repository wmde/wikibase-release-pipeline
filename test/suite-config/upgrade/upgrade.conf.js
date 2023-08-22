"use strict";

exports.config = {
  suite: {
    pre_upgrade: [
      "./specs/repo/api.js",
      "./specs/upgrade/pre-upgrade.js",
      "./specs/upgrade/queryservice-pre-and-post-upgrade.js",
    ],

    post_upgrade: [
      "./specs/repo/api.js",
      "./specs/upgrade/post-upgrade.js",
      "./specs/upgrade/queryservice-pre-and-post-upgrade.js",
      "./specs/upgrade/queryservice-post-upgrade.js",
    ],
  },
};
