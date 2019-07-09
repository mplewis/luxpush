#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

yarn build
yarn install --prod --modules-folder dist/node_modules
sam package \
  --s3-bucket aws-sam-artifacts-mplewis \
  --template-file template.yaml \
  --output-template-file packaged.yaml
