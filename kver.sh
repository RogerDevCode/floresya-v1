#!/bin/bash

# kexpress.sh
# KISS-style script to kill process on port 3000 and run Express server

# Don't exit on error (we want to keep running even if kill fails)
set +e

# Function to display messages
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Check if port 3000 is in use
if lsof -ti:3000 > /dev/null; then
    log "Port 3000 is in use. Finding and killing the process..."
    
    # Get the process ID using port 3000
    PID=$(lsof -ti:3000)
    
    if [ -n "$PID" ]; then
        log "Found process $PID on port 3000, killing it..."
        
        # Graceful shutdown
        kill -TERM "$PID"
        
        # Wait up to 3 seconds for graceful termination
        for i in {1..3}; do
            if ! kill -0 "$PID" 2>/dev/null; then
                log "Process $PID terminated gracefully."
                break
            fi
            sleep 1
        done
        
        # Force kill if still running
        if kill -0 "$PID" 2>/dev/null; then
            log "Process $PID did not terminate gracefully. Force killing..."
            kill -9 "$PID"
        fi
    else
        log "No process found on port 3000."
    fi
else
    log "Port 3000 is not in use."
fi

# Ensure port is free before starting
sleep 1

# Start Express server
# Assumes you have a script like "dev" or "start" in package.json
log "Starting Express server on http://localhost:3000..."
log "Press Ctrl+C to stop the server"
log ""

exec npm run dev