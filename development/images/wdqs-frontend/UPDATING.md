# Updating Query Service frontend

[Back to the release guide](../../docs/releasing.md#1-update-images-from-upstream-sources-optional)

Use this guide when the release refreshes the Query Service frontend.

## 1. Update the source

```bash
development/wbs-dev update-sources wdqs-frontend
```

The command updates the pinned Wikidata Query GUI development commit.

## 2. Review

Compare the commits and confirm that query behavior, configuration, and the local patches remain compatible.

## 3. Determine the impact

- **Patch:** a narrow corrective or presentation update.
- **Minor:** compatible new or changed frontend behavior.
- **Major:** incompatible configuration, endpoints, or user workflows.

[Continue with testing](../../docs/releasing.md#3-test-and-fix)
