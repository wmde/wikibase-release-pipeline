# Wikibase Release Process

## Generating diagrams

Diagrams are generated using [mermaidjs](https://github.com/mermaid-js/mermaid).

Build the container and install the necessary tools:
`docker build -t diagrams .`
`docker run -it --rm -v "$PWD:/app" -w /app  node:14 npm install`

Generate a SVG representation of the mermaid diagram with:

`docker run -it --rm -v "$PWD:/app" -w /app  diagrams node_modules/.bin/mmdc -i input.mmd -o output.svg`

If you get a Chrome error `Running as root without --no-sandbox is not supported` you might need to use the `--no-sandbox` option of the Puppeteer.

`docker run -it --rm -v "$PWD:/app" -w /app  diagrams node_modules/.bin/mmdc -p puppeteer-config.json -i input.mmd -o output.svg`
