# 14) Signing release packages {#adr_0014}

Date: 2021-05-03

## Status

accepted

## Context

During the course of release strategy hike a brief [investigation](https://phabricator.wikimedia.org/T272418) into signing of release packages was done.

Signing the artifacts our release pipeline produces is a step that can be taken to ensure their source and integrity. Our pipeline produces two different kinds of artifacts that both have the possibility to have a signature.

- Tarball packages
- Docker images

### Signing tarball packages with GPG

Tarball files can be signed with [GPG](https://gnupg.org/gph/en/manual/x135.html) in a similar way to which MediaWiki are signing theirs. In the case of MediaWiki a private and public key-pair is generated for release engineering members and published on https://www.mediawiki.org/keys/keys.html.

By importing the list of public keys the end-user can then verify the release tarball and it's signature by issuing the following commands.

Import keys:

```sh
$ gpg --fetch-keys "https://www.mediawiki.org/keys/keys.txt"
```

Verify release package:

```sh
$ gpg --verify mediawiki-core-1.35.2.zip.sig mediawiki-core-1.35.2.zip
gpg: Signature made tor  8 apr 2021 20:40:08 CEST
gpg:                using DSA key 1D98867E82982C8FE0ABC25F9B69B3109D3BB7B0
gpg: Good signature from "Sam Reed <reedy@wikimedia.org>" [unknown]
gpg: WARNING: This key is not certified with a trusted signature!
gpg:          There is no indication that the signature belongs to the owner.
Primary key fingerprint: 1D98 867E 8298 2C8F E0AB  C25F 9B69 B310 9D3B B7B0
```

### Signing docker images with Docker Content Trust

Docker images can be signed with [DCT](https://docs.docker.com/engine/security/trust/) which allows you to sign tags associated with images.

DCT works by using a set of keys to sign a specific tag in a docker repository. Using signatures is optional and only apply to a specific tag, there can be signed and unsigned tags within the same repository.

#### Root key

The root-key or "offline" key as named by the docker documentation is what is used to add new signers and repositories and is generally consider that it should be kept safe on offline hardware.

#### Repository key

For each image repository a specific key is used to sign the tags.

#### Signer key

The signer key is what is added to the docker registry and can be delegated in such a way that more than one signer can sign images for a single repository.

### Managing DCT and GPG keys

For DCT the signer and the publisher does not necessarily have to be the same person. A image can be published and then the signer can add a signature later by pulling and signing. (This way managing keys does not have to be a burden on everyone).

Root keys and GPG keys that represent WMDE as an organization should be generated and kept in a secure location. As there has been no previous signing of release packages the methods and processes required for maintaining, using and backing up these keys would have to be defined and formalized before they are applied.

Therefore the decision for the release pipeline will be not to sign any of the release packages in the first version (wmde.0 and wmde.1).

However the benefits of signing are obvious and therefore it's probably a good idea to take the time and answer the following questions to have a solid foundation to stand on when doing release signing.

- Which engineers are to be considered release engineers?

  - Needs access to organization in docker registry
  - Needs access to organization in github
  - Need access to `releasers-wikibase` group
  - Would need to publish and maintain a GPG key used for signing Docker and release tarballs

- How do we securely store/generate offline "organization" private keys?

- Where does WMDE publish public keys?

## Decision

- Do not sign docker images now
- Do not sign tarball artifacts now

## Consequences

- No signatures will be produced now
- The above questions should be answered before wikibase release packages will be signed.
