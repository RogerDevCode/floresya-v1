#!/bin/bash

# ========================================
# Auto Order Generator - Service Installer
# ========================================

set -e

echo "🚀 Installing Auto Order Generator Service..."
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Please run with sudo: sudo $0"
    exit 1
fi

# Get the current user (not root)
CURRENT_USER=$(logname 2>/dev/null || echo "manager")

# Install service file
echo "📦 Installing service file..."
cp scripts/auto-order-generator.service /etc/systemd/system/

# Update user in service file if needed
echo "👤 Setting user to: $CURRENT_USER"
sed -i "s/User=www-data/User=$CURRENT_USER/g" /etc/systemd/system/auto-order-generator.service
sed -i "s/Group=www-data/Group=$CURRENT_USER/g" /etc/systemd/system/auto-order-generator.service

# Set proper permissions
echo "🔒 Setting permissions..."
chown $CURRENT_USER:$CURRENT_USER /home/$CURRENT_USER/Sync/floresya-v1/.env.local
chmod 600 /home/$CURRENT_USER/Sync/floresya-v1/.env.local

# Reload systemd
echo "🔄 Reloading systemd..."
systemctl daemon-reload

# Enable service
echo "✅ Enabling service..."
systemctl enable auto-order-generator

echo ""
echo "=========================================="
echo "  🎉 SERVICE INSTALLED SUCCESSFULLY!"
echo "=========================================="
echo ""
echo "📋 Next steps:"
echo ""
echo "  1. Start the service:"
echo "     sudo systemctl start auto-order-generator"
echo ""
echo "  2. Check status:"
echo "     systemctl status auto-order-generator"
echo ""
echo "  3. View logs:"
echo "     journalctl -u auto-order-generator -f"
echo ""
echo "  4. Stop the service:"
echo "     sudo systemctl stop auto-order-generator"
echo ""
echo "  5. Restart the service:"
echo "     sudo systemctl restart auto-order-generator"
echo ""
echo "=========================================="
echo ""
echo "📊 The service will generate 100-300 orders per day"
echo "⏱️ Orders are distributed evenly over 24 hours"
echo ""
echo "To change the daily target, edit:"
echo "  /home/$CURRENT_USER/Sync/floresya-v1/.env.local"
echo ""
echo "  ORDER_GENERATOR_MIN_DAILY=100"
echo "  ORDER_GENERATOR_MAX_DAILY=300"
echo ""
echo "Then restart the service:"
echo "  sudo systemctl restart auto-order-generator"
echo ""
