# Product scripts

These scripts implement the host-side behavior behind the root `wbs` command.
They check host dependencies, prepare the published WBS tools image, and launch
the root Wikibase Suite Compose product. Source image builds cross into the
canonical `development/wbs-dev` tooling.

Use `./wbs` rather than invoking these internal scripts directly. Development
and release tooling lives under `development/tooling/`.
