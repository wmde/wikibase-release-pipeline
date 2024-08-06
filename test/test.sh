#!/usr/bin/env bash

NODE_NO_WARNINGS=1 node --require ts-node/register --loader=ts-node/esm cli.ts "$@"
