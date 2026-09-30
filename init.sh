#!/usr/bin/env bash
set -euo pipefail

export ASTRO_TELEMETRY_DISABLED=1

npm ci
npm run check
npm test
npm run build
npm run verify:build
