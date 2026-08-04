#!/usr/bin/env bash
set -e

# Make sure scripts are executable
chmod +x build.sh run.sh

./build.sh
./run.sh
