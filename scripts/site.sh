#!/usr/bin/env bash
set -euo pipefail
SITE_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
SITE_MANIFEST="$SITE_ROOT/config/toolchain.json"
# Flat string keys intentionally keep bootstrapping independent of a JSON runtime.
manifest_value() { sed -n 's/^[[:space:]]*"'"$1"'"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$SITE_MANIFEST"; }
SITE_VERSION="$(manifest_value nodeVersion)"
case "$(uname -s)" in Linux) SITE_PLATFORM=linux;; Darwin) SITE_PLATFORM=darwin;; *) echo 'Use scripts/site.ps1 on Windows. Supported shell systems: Linux, macOS.' >&2; exit 1;; esac
case "$(uname -m)" in x86_64|amd64) SITE_ARCH=x64;; aarch64|arm64) SITE_ARCH=arm64;; *) echo 'Supported architectures: x64 and arm64.' >&2; exit 1;; esac
SITE_NODE_DIR="$SITE_ROOT/.tools/node-v$SITE_VERSION-$SITE_PLATFORM-$SITE_ARCH"
SITE_NODE="$SITE_NODE_DIR/bin/node"
if [[ ! -x "$SITE_NODE" ]] && command -v node >/dev/null 2>&1 && [[ "$(node --version)" == "v$SITE_VERSION" ]]; then
    SITE_EXISTING_NODE="$(command -v node)"
    SITE_EXISTING_BIN="$(dirname -- "$SITE_EXISTING_NODE")"
    for SITE_EXISTING_NPM in "$SITE_EXISTING_BIN/../lib/node_modules/npm/bin/npm-cli.js" "$SITE_EXISTING_BIN/node_modules/npm/bin/npm-cli.js"; do
        if [[ -f "$SITE_EXISTING_NPM" ]] && [[ "$("$SITE_EXISTING_NODE" "$SITE_EXISTING_NPM" --version)" == "$(manifest_value npmVersion)" ]]; then SITE_NODE="$SITE_EXISTING_NODE"; break; fi
    done
fi
if [[ ! -x "$SITE_NODE" ]]; then
    command -v curl >/dev/null || { echo 'Install curl to bootstrap Node.js.' >&2; exit 1; }
    command -v tar >/dev/null || { echo 'Install tar to bootstrap Node.js.' >&2; exit 1; }
    SITE_NODE_DOWNLOAD_URL="$(manifest_value "node-$SITE_PLATFORM-$SITE_ARCH-url")"
    SITE_SHA="$(manifest_value "node-$SITE_PLATFORM-$SITE_ARCH-sha256")"
    [[ -n "$SITE_NODE_DOWNLOAD_URL" && -n "$SITE_SHA" ]] || { echo 'No pinned Node.js archive for this platform.' >&2; exit 1; }
    mkdir -p "$SITE_ROOT/.tools"
    SITE_TEMP="$(mktemp -d "$SITE_ROOT/.tools/bootstrap.XXXXXXXX")"
    trap 'rm -rf -- "$SITE_TEMP"' EXIT
    echo "Downloading pinned Node.js $SITE_VERSION..."
    curl --fail --location --retry 3 --connect-timeout 20 "$SITE_NODE_DOWNLOAD_URL" -o "$SITE_TEMP/node.tar.gz"
    if command -v sha256sum >/dev/null 2>&1; then SITE_ACTUAL="$(sha256sum "$SITE_TEMP/node.tar.gz" | cut -d ' ' -f 1)";
    elif command -v shasum >/dev/null 2>&1; then SITE_ACTUAL="$(shasum -a 256 "$SITE_TEMP/node.tar.gz" | cut -d ' ' -f 1)";
    else echo 'Install sha256sum or shasum to verify downloads.' >&2; exit 1; fi
    [[ "$SITE_ACTUAL" == "$SITE_SHA" ]] || { echo 'Node.js download checksum mismatch.' >&2; exit 1; }
    tar -xzf "$SITE_TEMP/node.tar.gz" -C "$SITE_TEMP"
    mv -- "$SITE_TEMP/node-v$SITE_VERSION-$SITE_PLATFORM-$SITE_ARCH" "$SITE_NODE_DIR"
    rm -rf -- "$SITE_TEMP"
    trap - EXIT
fi
exec "$SITE_NODE" "$SITE_ROOT/scripts/site.mjs" "$@"
