{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let pkgs = nixpkgs.legacyPackages.${system};
      in
      with pkgs; {
        devShell = with pkgs; mkShell {
          buildInputs = [
            docker-client
            gnumake
            envsubst
          ];

          shellHook = ''
            ${pkgs.figlet}/bin/figlet "wbsrpl dev shell"
            echo "Wikibase Release Pipeline"
            echo

            echo "Build Commands:"
            echo "# Build all wikibase suite components docker images"
            echo "$ ./build.sh"
            echo "# Build only the mediawiki/wikibase containers"
            echo "$ ./build.sh wikibase"
            echo "# Build only the query service container and save the docker image to a tarball"
            echo "$ ./build.sh --save-image wdqs"
            echo "# Build the wdqs-frontend container and extract a standalone tarball from the webroot"
            echo "$ ./build.sh --extract-tarball wdqs-frontend"
            echo
            echo "Test Commands:"
            echo "$ ./test.sh"
            echo "$ ./test.sh repo"
            echo "$ ./test.sh repo special-item"
            echo "$ make test-upgrade VERSION=wmde.9"
            echo
            echo "Example Instance Commands:"
            echo "$ docker compose \\"
            echo "    -f ./example/docker-compose.yml \\"
            echo "    -f ./example/docker-compose.extra.yml \\"
            echo "    --env-file ./example/template.env up"
          '';
        };
      });
}
