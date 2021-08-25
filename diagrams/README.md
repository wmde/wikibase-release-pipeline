# Wikibase Release pipeline diagrams

## Generating diagrams

Diagrams are generated using [mermaidjs](https://github.com/mermaid-js/mermaid).

Build the container and install the necessary tools:

`docker build -t diagrams .`
`docker run -it --rm -v "$PWD:/app" -w /app  node:14 npm install`

Generate a SVG representation of the mermaid diagram with:

`docker run -it --rm -v "$PWD:/app" diagrams node_modules/.bin/mmdc -i main.mmd -o output.svg`

If you get a Chrome error `Running as root without --no-sandbox is not supported` you might need to use the `--no-sandbox` option of the Puppeteer.

`docker run -it --rm -v "$PWD:/app" diagrams node_modules/.bin/mmdc -p puppeteer-config.json -i main.mmd -o output.svg`

## Building diagrams for documentation

There is a `build.sh` script to build all documentation diagrams in one go by running. This can be run either inside or outside the docker container.

