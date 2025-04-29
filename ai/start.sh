#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "Sourcing uv environment script..."
# Source the uv environment script to add uv to PATH
# $HOME expands to /root in this container for the root user
. $HOME/.local/bin/env # <-- Add this line

echo "Activating virtual environment..."
# Source the virtual environment
. /root/hellojob/venv/bin/activate

echo "Changing directory to /root/hellojob/app/mcp/dart-mcp/..."
# Change to the target directory
cd /root/hellojob/app/mcp/dart-mcp/

echo "Running uv sync..."
# Run the uv sync command
uv sync

# Optional: Change back to the main application directory
echo "Changing back to /root/hellojob/..."
cd /root/hellojob/

echo "Starting FastAPI application..."
# Execute the main application command
# Using 'exec' ensures signals (like Ctrl+C) are passed correctly to uvicorn
exec uvicorn main:app --host 0.0.0.0 --port 8000 --reload