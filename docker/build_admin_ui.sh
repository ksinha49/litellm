#!/bin/bash

# try except this script
set -e

set -x
echo "Current working directory: $(pwd)"


# Build Admin UI
echo "Building Custom Admin UI..."

# Install dependencies
# Check if we are on macOS
if [[ "$(uname)" == "Darwin" ]]; then
    # Install dependencies using Homebrew
    if ! command -v brew &> /dev/null; then
        echo "Error: Homebrew not found. Please install Homebrew and try again."
        exit 1
    fi
    brew update
    brew install curl
else
    # Assume Linux, try using available package manager
    if command -v dnf &> /dev/null; then
        # Use dnf or yum if available
        if ! command -v curl &> /dev/null; then
            dnf -y install curl
        fi
    elif command -v yum &> /dev/null; then
        if ! command -v curl &> /dev/null; then
            yum -y install curl
        fi
    elif command -v apt-get &> /dev/null; then
        apt-get update
        apt-get install -y curl
    elif command -v apk &> /dev/null; then
        # Try using apk if apt-get is not available
        apk update
        apk add curl
    else
        echo "Error: Unsupported package manager. Cannot install dependencies."
        exit 1
    fi
fi
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
source ~/.nvm/nvm.sh
nvm install v20
nvm use v20
# Use npm bundled with Node 20 without upgrading
# npm install -g npm

# copy enterprise colors if available; otherwise, use default LiteLLM UI
if [ -f "enterprise/enterprise_ui/enterprise_colors.json" ]; then
    cp enterprise/enterprise_ui/enterprise_colors.json ui/litellm-dashboard/ui_colors.json
else
    echo "Admin UI - using default LiteLLM UI"
    cat <<'EOF' > ui/litellm-dashboard/ui_colors.json
{
  "brand": {
    "faint": "#EFF6FF",
    "muted": "#DBEAFE",
    "subtle": "#BFDBFE",
    "DEFAULT": "#3B82F6",
    "emphasis": "#1D4ED8",
    "inverted": "#FFFFFF"
  }
}
EOF
fi

ls -al ui/litellm-dashboard
echo "Latest commit:"
if git rev-parse --git-dir > /dev/null 2>&1; then
    git log -1 --oneline
else
    echo "Git metadata not available"
fi

# Clean existing Admin UI build output and Next.js cache to avoid stale files
echo "Cleaning Admin UI output directory..."
rm -rf litellm/proxy/_experimental/out

# cd in to /ui/litellm-dashboard
cd ui/litellm-dashboard

# Note: build_ui.sh will clean .next, out, and node_modules/.cache before building

# ensure have access to build_ui.sh
chmod +x ./build_ui.sh

# run ./build_ui.sh
./build_ui.sh || exit 1

# return to root directory
cd ../..
set +x
