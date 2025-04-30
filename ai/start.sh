#!/bin/bash

echo "Activating virtual environment..."
# Source the virtual environment
. /root/hellojob/venv/bin/activate

echo "Starting FastAPI application..."
# Execute the main application command
exec uvicorn main:app --host 0.0.0.0 --port 8000 --reload