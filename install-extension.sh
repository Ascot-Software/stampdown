#!/bin/bash

# Stampdown VS Code Extension Installer
# Installs the Stampdown syntax highlighting extension

echo "🚀 Installing Stampdown VS Code Extension..."

# Determine the OS
OS="$(uname -s)"
case "${OS}" in
    Linux*)     VSCODE_EXT_DIR="$HOME/.vscode/extensions";;
    Darwin*)    VSCODE_EXT_DIR="$HOME/.vscode/extensions";;
    MINGW*|MSYS*|CYGWIN*) VSCODE_EXT_DIR="$USERPROFILE/.vscode/extensions";;
    *)          echo "❌ Unsupported operating system: ${OS}"; exit 1;;
esac

# Extension directory
EXT_NAME="stampdown-0.1.0"
EXT_DIR="$VSCODE_EXT_DIR/$EXT_NAME"

# Create extensions directory if it doesn't exist
mkdir -p "$VSCODE_EXT_DIR"

# Remove old version if exists
if [ -d "$EXT_DIR" ]; then
    echo "🗑️  Removing old version..."
    rm -rf "$EXT_DIR"
fi

# Copy extension files
echo "📦 Copying extension files..."
cp -r "$(dirname "$0")/vscode-extension" "$EXT_DIR"

if [ $? -eq 0 ]; then
    echo "✅ Extension installed successfully!"
    echo ""
    echo "📍 Installed to: $EXT_DIR"
    echo ""
    echo "Next steps:"
    echo "1. Reload VS Code (or restart)"
    echo "2. Open any .sdt file"
    echo "3. Enjoy syntax highlighting! 🎨"
    echo ""
    echo "To verify installation:"
    echo "  - Open VS Code"
    echo "  - Go to Extensions (Cmd/Ctrl + Shift + X)"
    echo "  - Search for 'Stampdown'"
    echo ""
else
    echo "❌ Installation failed!"
    exit 1
fi
