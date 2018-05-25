#!/bin/bash
zip -u Archive.zip &&
aws lambda update-function-code --function-name "recaptcha-request-api" --zip-file "fileb://Archive.zip" --region "us-east-2" --profile sysadmin
