#!/usr/bin/env bash
# Build Tauri artifacts for the current host (Windows or macOS) for all common architectures.
set -euo pipefail

# Run from repo root
cd "$(dirname "$0")/.."

echo "Installing JS deps..."
pnpm install

uname_out="$(uname -s || true)"
case "${uname_out}" in
  Darwin)
    echo "Adding macOS targets..."
    rustup target add x86_64-apple-darwin aarch64-apple-darwin
    echo "Building macOS (x64)..."
    pnpm tauri build --target x86_64-apple-darwin
    echo "Building macOS (arm64)..."
    pnpm tauri build --target aarch64-apple-darwin
    ;;
  MINGW*|MSYS*|CYGWIN*|Windows_NT)
    echo "Adding Windows targets..."
    rustup target add x86_64-pc-windows-msvc aarch64-pc-windows-msvc
    echo "Building Windows (x64)..."
    pnpm tauri build --target x86_64-pc-windows-msvc
    echo "Building Windows (arm64)..."
    pnpm tauri build --target aarch64-pc-windows-msvc
    ;;
  *)
    echo "Unsupported host: ${uname_out}"
    exit 1
    ;;
esac

echo "Done. Bundles are in src-tauri/target/release/bundle/"
