# Updating the QLever Query Service image

[Back to the release guide](../../docs/release.md#prepare-a-release)

`qlever` pins the upstream QLever OCI image by digest and contains the tested
default `Qleverfile`. Review a newer upstream image, update the digest in
`docker-bake.hcl`, review the bundled configuration, and release the wrapper
independently:

```sh
wbs-dev build qlever qlever-updater
wbs-dev test qlever
```

Rehearse a full export and index rebuild in the development QLever test
fixture. A QLever static index is data-format dependent; upstream changes must
be tested against both the full index and persisted incremental updates.
