#!/bin/bash
cd /home/manager/Sync/floresya-v1
nohup node scripts/auto-order-generator.js > generator.log 2>&1 &
echo "✅ Generator started in background"
echo "📊 PID: $!"
echo ""
echo "📋 Commands:"
echo "  - View logs: tail -f generator.log"
echo "  - Stop: pkill -f auto-order-generator.js"
echo "  - Check: ps aux | grep auto-order-generator"
