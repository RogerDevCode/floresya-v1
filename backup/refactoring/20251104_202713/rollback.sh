#!/bin/bash
# Rollback script to restore original files
echo "Rolling back changes from: backup/refactoring/20251104_202713"
for file in "backup/refactoring/20251104_202713"/*.js; do
  if [ -f "$file" ]; then
    original="${file#backup/refactoring/20251104_202713/}"
    echo "Restoring: $original"
    cp "$file" "/home/manager/Sync/floresya-v1/$original"
  fi
done
echo "Rollback complete!"
