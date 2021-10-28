#!/bin/bash
set -euo pipefail

PATH="$PATH:$(pwd)/.bin"

if [ ! -f ".bin/keto" ]; then
  mkdir ".bin"
  bash <(curl https://raw.githubusercontent.com/ory/keto/master/install.sh) -b .bin v0.7.0-alpha.1
fi

function teardown() {
    kill "$keto_server_pid" || true
}
trap teardown EXIT

keto serve -c ./keto.yml &
keto_server_pid=$!

npx nodemon server.ts
