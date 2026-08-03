# Updating WBS tools

[Back to the release guide](../../docs/releasing.md#2-complete-the-product-changes)

WBS tools is repository-owned code and has no `update-sources` step. Its version and changelog are generated later from conventional commits.

## 1. Review the changes

Review the application, dependencies, and Node runtime changes since the latest `wbs-tools@<version>` tag. Check compatibility with the mounted WBS checkout, the `wbs` command, generated configuration, Docker, Git, and the installer.

The WBS tools image can be published independently. WBS selects its compatible major tag, so minor and patch tools releases become available to normal installations without a WBS release. A new tools major version requires a WBS release to select it.

## 2. Determine the impact

- **Patch:** a compatible fix, security update, or dependency refresh.
- **Minor:** backward-compatible commands or installer functionality.
- **Major:** incompatible commands, configuration, or WBS requirements.

[Continue with testing](../../docs/releasing.md#3-test-and-fix)
