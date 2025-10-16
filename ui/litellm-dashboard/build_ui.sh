#!/bin/bash

# ============================================
# Memory Cleanup - Start
# ============================================
echo "=========================================="
echo "Pre-build memory cleanup starting..."
echo "=========================================="

# Show initial memory state
if command -v free &> /dev/null; then
  echo "Memory before cleanup:"
  free -h
fi

# Clear npm cache to free up memory
echo "Clearing npm cache..."
npm cache clean --force 2>/dev/null || true

# Clear any previous build artifacts
echo "Clearing previous build artifacts..."
rm -rf .next 2>/dev/null || true
rm -rf out 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true

# Sync filesystem to flush buffers
echo "Syncing filesystem..."
sync

# Try to drop system caches if running with sufficient privileges
# This is optional and will fail gracefully if not permitted
if [ -w /proc/sys/vm/drop_caches ]; then
  echo "Dropping system caches..."
  sync && echo 3 > /proc/sys/vm/drop_caches 2>/dev/null || true
fi

# Show memory state after cleanup
if command -v free &> /dev/null; then
  echo "Memory after cleanup:"
  free -h
fi

echo "Pre-build cleanup completed."
echo "=========================================="

# Check if nvm is not installed
if ! command -v nvm &> /dev/null; then
  # Install nvm
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash

  # Source nvm script in the current session
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi

# Use nvm to set the required Node.js version
NODE_VERSION="v20"
nvm use $NODE_VERSION

# Check if nvm use was successful
if [ $? -ne 0 ]; then
  echo "Error: Failed to switch to Node.js $NODE_VERSION. Deployment aborted."
  exit 1
fi

# print contents of ui_colors.json
echo "Contents of ui_colors.json:"
cat ui_colors.json

# Increase Node.js heap limit to prevent build worker OOM kills
export NODE_OPTIONS="--max-old-space-size=4096 --max-semi-space-size=512"

# Clean build cache and output directories to ensure fresh build
echo "Cleaning build cache and output directories..."
rm -rf .next
rm -rf out
rm -rf node_modules/.cache

# Run npm build
npm run build

# Check if the build was successful
if [ $? -eq 0 ]; then
  echo "Build successful. Copying files..."

  # echo current dir
  echo
  pwd

  # Ensure favicon is included in build output
  cp ./public/favicon.png ./out/favicon.png

  # Specify the destination directory
  destination_dir="../../litellm/proxy/_experimental/out"

  # Remove existing files in the destination directory to avoid stale files
  rm -rf "$destination_dir"
  mkdir -p "$destination_dir"

  # Copy the contents of the output directory to the specified destination
  cp -r ./out/* "$destination_dir"

  echo "Contents of out/:"
  ls -al out/
  echo "Contents of $destination_dir:"
  ls -al "$destination_dir"

  echo "Deployment completed."
else
  echo "Build failed. Deployment aborted."
  exit 1
fi

# ============================================
# Memory Cleanup - End
# ============================================
echo "=========================================="
echo "Post-build memory cleanup starting..."
echo "=========================================="

# Clear build caches and temporary files
echo "Clearing build caches..."
rm -rf .next 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true

# Clear npm cache again
echo "Clearing npm cache..."
npm cache clean --force 2>/dev/null || true

# Sync filesystem to ensure all writes are flushed
echo "Syncing filesystem..."
sync

# Try to drop system caches if running with sufficient privileges
if [ -w /proc/sys/vm/drop_caches ]; then
  echo "Dropping system caches..."
  sync && echo 3 > /proc/sys/vm/drop_caches 2>/dev/null || true
fi

# Show final memory state
if command -v free &> /dev/null; then
  echo "Memory after post-build cleanup:"
  free -h
fi

echo "Post-build cleanup completed."
echo "=========================================="

set +x
echo "build_ui.sh finished"
