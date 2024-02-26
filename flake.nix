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
            echo "# Build the wdqs container without using Dockers cache"
            echo "$ ./build.sh --no-cache wdqs"
            echo
            echo "Test Commands:"
            echo "$ ./test.sh"
            echo "$ ./test.sh repo"
            echo "$ ./test.sh repo --spec specs/repo/special-item.ts"
            echo "$ ./test.sh upgrade WMDE9"
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
