#!/usr/bin/env bash
# package-extension.sh — Auto-bump version, build, test, and package Pinoria for Chrome Web Store

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

BUMP_TYPE="patch"
SKIP_TEST=false

for arg in "$@"; do
  case "$arg" in
    --no-bump)
      BUMP_TYPE="none"
      ;;
    --skip-test)
      SKIP_TEST=true
      ;;
    patch|minor|major)
      BUMP_TYPE="$arg"
      ;;
    [0-9]*.[0-9]*.[0-9]*)
      BUMP_TYPE="custom:$arg"
      ;;
    -h|--help)
      echo "Usage: ./package-extension.sh [patch|minor|major|<x.y.z>|--no-bump] [--skip-test]"
      echo ""
      echo "Examples:"
      echo "  ./package-extension.sh            # Auto-bump patch (0.3.1 -> 0.3.2) & package"
      echo "  ./package-extension.sh minor      # Auto-bump minor (0.3.1 -> 0.4.0) & package"
      echo "  ./package-extension.sh 0.4.0      # Set explicit version 0.4.0 & package"
      echo "  ./package-extension.sh --no-bump  # Build & package current version without bumping"
      exit 0
      ;;
    *)
      echo "❌ Error: Unknown argument '$arg'. Run with --help for usage."
      exit 1
      ;;
  esac
done

CURRENT_VERSION=$(node -e "console.log(require('./package.json').version)")

if [ "$BUMP_TYPE" = "none" ]; then
  NEW_VERSION="$CURRENT_VERSION"
else
  NEW_VERSION=$(python3 - <<EOF
import sys

cur = "$CURRENT_VERSION".strip()
parts = [int(p) for p in cur.split('.')]
bump = "$BUMP_TYPE"

if bump == "patch":
    parts[2] += 1
elif bump == "minor":
    parts[1] += 1
    parts[2] = 0
elif bump == "major":
    parts[0] += 1
    parts[1] = 0
    parts[2] = 0
elif bump.startswith("custom:"):
    parts = [int(p) for p in bump.split(":")[1].split(".")]

print(f"{parts[0]}.{parts[1]}.{parts[2]}")
EOF
)
fi

echo "=========================================================="
echo "🚀 Pinoria Extension Packaging Workflow"
echo "=========================================================="
echo "• Current Version : v${CURRENT_VERSION}"
echo "• Target Version  : v${NEW_VERSION}"
echo "=========================================================="

if [ "$CURRENT_VERSION" != "$NEW_VERSION" ]; then
  echo "📝 Updating version to ${NEW_VERSION} in configuration files..."

  python3 - <<EOF
import json, re

new_ver = "$NEW_VERSION"

# 1. package.json
with open('package.json', 'r', encoding='utf-8') as f:
    pkg = json.load(f)
pkg['version'] = new_ver
with open('package.json', 'w', encoding='utf-8') as f:
    json.dump(pkg, f, indent=2)
    f.write('\n')

# 2. manifest.config.ts
with open('manifest.config.ts', 'r', encoding='utf-8') as f:
    manifest_ts = f.read()
manifest_ts = re.sub(r"version:\s*'[^']+'", f"version: '{new_ver}'", manifest_ts)
with open('manifest.config.ts', 'w', encoding='utf-8') as f:
    f.write(manifest_ts)

# 3. CHROMEWEBSTORE.md
try:
    with open('CHROMEWEBSTORE.md', 'r', encoding='utf-8') as f:
        cws = f.read()
    cws = re.sub(r'>\s*Version:\s*[0-9.]+', f'> Version: {new_ver}', cws)
    cws = re.sub(r'Version\s+[0-9.]+\s*—', f'Version {new_ver} —', cws)
    with open('CHROMEWEBSTORE.md', 'w', encoding='utf-8') as f:
        f.write(cws)
except Exception as e:
    print(f"Warning updating CHROMEWEBSTORE.md: {e}")

# 4. package-lock.json
try:
    with open('package-lock.json', 'r', encoding='utf-8') as f:
        lock = json.load(f)
    lock['version'] = new_ver
    if 'packages' in lock and '' in lock['packages']:
        lock['packages']['']['version'] = new_ver
    with open('package-lock.json', 'w', encoding='utf-8') as f:
        json.dump(lock, f, indent=2)
        f.write('\n')
except Exception:
    pass

print("✅ Files updated successfully.")
EOF
fi

if [ "$SKIP_TEST" = false ]; then
  echo ""
  echo "🧪 Running unit tests..."
  npm test
fi

echo ""
echo "🏗️  Building production assets with Vite..."
npm run build

if [ ! -d "dist" ] || [ ! -f "dist/manifest.json" ]; then
  echo "❌ Error: Build output dist/manifest.json not found."
  exit 1
fi

DIST_VERSION=$(grep -o '"version": *"[^"]*"' dist/manifest.json | head -1 | cut -d'"' -f4)
if [ "$DIST_VERSION" != "$NEW_VERSION" ]; then
  echo "❌ Error: Version mismatch! Expected ${NEW_VERSION} but dist/manifest.json has ${DIST_VERSION}."
  exit 1
fi

mkdir -p releases
OUTPUT_ZIP="Pinoria-v${NEW_VERSION}.zip"
RELEASE_ZIP="releases/${OUTPUT_ZIP}"

rm -f "$OUTPUT_ZIP" "$RELEASE_ZIP"

echo ""
echo "📦 Creating ZIP package..."
cd dist
zip -r -q "../$OUTPUT_ZIP" . \
  -x ".DS_Store" \
  -x "*/.DS_Store" \
  -x "*.map"
cd ..

cp "$OUTPUT_ZIP" "$RELEASE_ZIP"

FILE_SIZE=$(du -h "$OUTPUT_ZIP" | cut -f1)
FULL_PATH="${PROJECT_DIR}/${OUTPUT_ZIP}"

# Trigger native macOS Desktop Notification
if command -v osascript &>/dev/null; then
  osascript -e "display notification \"Bản đóng gói ${OUTPUT_ZIP} (${FILE_SIZE}) đã sẵn sàng để nộp lên Chrome Web Store!\" with title \"Pinoria Packaged Successfully\"" 2>/dev/null || true
fi

echo ""
echo "=========================================================="
echo "🎉 ĐÓNG GÓI THÀNH CÔNG — SẴN SÀNG NỘP CHROME WEB STORE!"
echo "=========================================================="
echo "• File ZIP     : ${OUTPUT_ZIP} (${FILE_SIZE})"
echo "• Đường dẫn    : ${FULL_PATH}"
echo "• Backup tại   : ${PROJECT_DIR}/${RELEASE_ZIP}"
echo "• Version mới  : v${NEW_VERSION}"
echo "• Tên hiển thị : Pinoria - Better Pinterest Video & Image Downloader"
echo "=========================================================="
echo ""
echo "📋 CÁC BƯỚC NỘP EXTENSION LÊN CHROME STORE:"
echo "1. Mở trang quản trị: https://chrome.google.com/webstore/devconsole"
echo "2. Chọn tiện ích 'Pinoria' > vào mục 'Package' (Gói)"
echo "3. Bấm 'Upload new package' và kéo thả file:"
echo "   👉 ${FULL_PATH}"
echo "4. Cập nhật tiêu đề & mô tả theo file: CHROMEWEBSTORE.md"
echo "5. Bấm 'Submit for review' (Gửi xét duyệt)."
echo "=========================================================="
