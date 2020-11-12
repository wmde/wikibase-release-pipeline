#!/bin/bash
#!/bin/bash

ROOT=`pwd`
TARBALL="service-$QUERYSERVICE_VERSION-dist.tar.gz"

wget "https://archiva.wikimedia.org/repository/releases/org/wikidata/query/rdf/service/$QUERYSERVICE_VERSION/$TARBALL"