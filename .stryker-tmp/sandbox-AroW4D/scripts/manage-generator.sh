#!/bin/bash

# ========================================
# Auto Order Generator Management Script
# ========================================

PROJECT_DIR="/home/manager/Sync/floresya-v1"
LOG_FILE="$PROJECT_DIR/generator.log"
PID_FILE="$PROJECT_DIR/generator.pid"

cd "$PROJECT_DIR"

# Function to start the generator
start_generator() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p $PID > /dev/null 2>&1; then
            echo "⚠️  Generator is already running (PID: $PID)"
            return 1
        else
            echo "🧹 Cleaning up stale PID file..."
            rm -f "$PID_FILE"
        fi
    fi

    echo "🚀 Starting Auto Order Generator..."
    nohup node scripts/auto-order-generator.js > "$LOG_FILE" 2>&1 &
    PID=$!
    echo $PID > "$PID_FILE"
    sleep 2

    if ps -p $PID > /dev/null 2>&1; then
        echo "✅ Generator started successfully"
        echo "   PID: $PID"
        echo "   Log: $LOG_FILE"
        echo "   Daily Target: 100-300 orders (random)"
        return 0
    else
        echo "❌ Failed to start generator"
        rm -f "$PID_FILE"
        return 1
    fi
}

# Function to stop the generator
stop_generator() {
    if [ ! -f "$PID_FILE" ]; then
        echo "⚠️  No PID file found. Generator may not be running."
        echo "🔍 Searching for process..."
        pkill -f "auto-order-generator.js" && echo "✅ Stopped generator" || echo "❌ Generator not running"
        return 0
    fi

    PID=$(cat "$PID_FILE")
    if ps -p $PID > /dev/null 2>&1; then
        echo "🛑 Stopping generator (PID: $PID)..."
        kill $PID
        sleep 2

        if ps -p $PID > /dev/null 2>&1; then
            echo "⚠️  Generator didn't stop. Sending SIGKILL..."
            kill -9 $PID
        fi

        echo "✅ Generator stopped"
    else
        echo "⚠️  Process $PID is not running"
    fi

    rm -f "$PID_FILE"
    return 0
}

# Function to show status
show_status() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p $PID > /dev/null 2>&1; then
            echo "✅ Generator is RUNNING"
            echo "   PID: $PID"
            echo "   Uptime: $(ps -o etime= -p $PID 2>/dev/null || echo 'unknown')"
            echo "   Command: $(ps -o cmd= -p $PID 2>/dev/null)"
            return 0
        else
            echo "❌ Generator is NOT RUNNING (stale PID file)"
            return 1
        fi
    else
        echo "❌ Generator is NOT RUNNING"
        return 1
    fi
}

# Function to show logs
show_logs() {
    if [ -f "$LOG_FILE" ]; then
        echo "📄 Last 50 lines of generator.log:"
        echo "=========================================="
        tail -n 50 "$LOG_FILE"
    else
        echo "⚠️  Log file not found: $LOG_FILE"
    fi
}

# Function to follow logs
follow_logs() {
    if [ -f "$LOG_FILE" ]; then
        echo "📄 Following generator.log (Ctrl+C to stop)..."
        echo "=========================================="
        tail -f "$LOG_FILE"
    else
        echo "❌ Log file not found: $LOG_FILE"
    fi
}

# Function to restart
restart_generator() {
    echo "🔄 Restarting generator..."
    stop_generator
    sleep 2
    start_generator
}

# Main script
case "$1" in
    start)
        start_generator
        ;;
    stop)
        stop_generator
        ;;
    restart)
        restart_generator
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    tail)
        follow_logs
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs|tail}"
        echo ""
        echo "Commands:"
        echo "  start   - Start the generator in background"
        echo "  stop    - Stop the running generator"
        echo "  restart - Stop and start again"
        echo "  status  - Show if generator is running"
        echo "  logs    - Show last 50 log lines"
        echo "  tail    - Follow logs in real-time"
        echo ""
        exit 1
        ;;
esac

exit $?
