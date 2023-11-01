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
            echo "$ ./build.sh all"
            echo "$ ./build.sh wikibase"
            echo
            echo "Test Commands:"
            echo "$ make test"
            echo "$ make test SUITE=repo"
            echo "$ make test SUITE=repo FILTER=special-item"
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
