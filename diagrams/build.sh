#!/bin/bash

## Build dynamic overview
TMP_FILE="$(mktemp -d)/input.mmd"
echo "graph TD" >> "$TMP_FILE"
node make_overview.js >> "$TMP_FILE"

OUTPUT=output
if [ -n "$1" ]; then
    OUTPUT="$1"
fi

## Build overview into output folder
./node_modules/.bin/mmdc -i "$TMP_FILE" -o "${OUTPUT}/overview.svg"


## Build static diagram in input folder
for filename in input/*.mmd; do
    [ -e "$filename" ] || continue
    outputFile="$(basename "${filename%.*}")"
    ./node_modules/.bin/mmdc -i "$filename" -o "${OUTPUT}/${outputFile}.svg"
done

