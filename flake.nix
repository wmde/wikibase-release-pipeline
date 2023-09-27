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
            echo "$ ./build.sh all versions/wmde11.env"
            echo "$ ./build.sh wikibase_bundle versions/wmde12.env"
            echo
            echo "Test Commands:"
            echo "$ make test-all"
            echo "$ make test SUITE=repo"
            echo "$ make test SUITE=repo CHANNEL=lts"
            echo "$ make test SUITE=repo FILTER=special-item"
            echo "$ make test-upgrade VERSION=wmde.9 TO_VERSION=versions/wmde12.env"
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
