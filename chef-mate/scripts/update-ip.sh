#!/usr/bin/env bash

# File to update
ENV_FILE=".env.development"

# Get local IP address (macOS specific)
LOCAL_IP=$(ipconfig getifaddr en0)

# If en0 fails (e.g., using Ethernet), try en1
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP=$(ipconfig getifaddr en1)
fi

# Fallback if both fail
if [ -z "$LOCAL_IP" ]; then
    echo "Error: Could not determine local IP address."
    exit 1
fi

echo "Found local IP: $LOCAL_IP"

# Check if the file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "Error: $ENV_FILE not found in current directory."
    exit 1
fi

# Use sed to replace the VITE_API_BASE_URL line
# It looks for lines starting with VITE_API_BASE_URL= and replaces everything after the = with http://$LOCAL_IP:3000
sed -i '' "s|^VITE_API_BASE_URL=.*|VITE_API_BASE_URL=http://$LOCAL_IP:3000|g" "$ENV_FILE"

echo "Updated $ENV_FILE:"
grep "VITE_API_BASE_URL" "$ENV_FILE"
