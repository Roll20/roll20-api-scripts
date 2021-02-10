#!/bin/bash

YAJSV_BIN=./yajsv.linux.amd64

function validate_json() {
  $YAJSV_BIN -s script.json.schema "$1/script.json"
  yajsv_code=$?
  if [[ $yajsv_code -ne 0 ]]; then
    echo "failed yajsv validation"
    success="no"
  fi
}

function validate_versions() {
  versions=($(jq '.previousversions[]' "$1/script.json" -r))
  for version in "${versions[@]}"; do
    if [ ! -d "$1/$version" ]; then
      echo "version $version of $1 doesn't exist!"
      success="no"
    fi
  done
}

function validate() {
    validate_json "$1"
    validate_versions "$1"
}

success="yes"
validate "$1"
if [ "$success" = "no" ]; then
  echo "validation failed"
  exit 1
else
  echo "validation succeeded"
  exit 0
fi