#!/usr/bin/env bash
# package-extension.sh — Creates a clean store-ready ZIP for Pinoria (PinKit)

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

if [ ! -d "dist" ] || [ ! -f "dist/manifest.json" ]; then
  echo "❌ Error: dist/ directory or dist/manifest.json not found."
  exit 1
fi

VERSION=$(grep -o '"version": *"[^"]*"' dist/manifest.json | head -1 | cut -d'"' -f4)
EXTENSION_NAME="Pinoria"
OUTPUT_ZIP="${EXTENSION_NAME}-v${VERSION}.zip"

echo "=========================================="
echo "📦 Packing Chrome Extension: ${EXTENSION_NAME} v${VERSION}"
echo "=========================================="

rm -f "$OUTPUT_ZIP"

# Zip contents of dist directly so manifest.json is at root of ZIP
cd dist
zip -r -q "../$OUTPUT_ZIP" . \
  -x ".DS_Store" \
  -x "*/.DS_Store"
cd ..

if [ -f "$OUTPUT_ZIP" ]; then
  FILE_SIZE=$(du -h "$OUTPUT_ZIP" | cut -f1)
  echo "✅ Package created successfully: ${OUTPUT_ZIP} (${FILE_SIZE})"
  echo ""
  echo "📋 Files included in package (manifest.json at root):"
  unzip -l "$OUTPUT_ZIP" | head -n 15
  echo "... (total $(unzip -l "$OUTPUT_ZIP" | tail -n 1 | awk '{print $2}') files)"
  echo ""
  echo "🚀 Ready for Chrome Web Store upload!"
else
  echo "❌ Error: Failed to create package."
  exit 1
fi
