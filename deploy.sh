#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

AWS_DEFAULT_REGION=us-west-1 \
aws cloudformation deploy \
  --capabilities CAPABILITY_IAM \
  --template-file packaged.yaml \
  --stack-name luxpush
