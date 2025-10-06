#!/usr/bin/env python3
"""
Script to remove duplicate entries in the OpenAPI annotations file
"""

# Read the file
with open('/home/manager/Sync/floresya-v1/api/docs/openapi-annotations.js', 'r') as f:
    lines = f.readlines()

# Find and mark sections to remove
lines_to_remove = []
in_duplicate_section = False
duplicate_start_line = -1

for i, line in enumerate(lines):
    if '*     summary: Update order status' in line and not in_duplicate_section:
        # This is the first occurrence, continue normally
        continue
    elif '*     summary: Update order status' in line and in_duplicate_section:
        # This is the start of the duplicate section
        in_duplicate_section = True
        duplicate_start_line = i
    elif in_duplicate_section and line.strip() == ' */':
        # This is the end of the duplicate section
        lines_to_remove.extend(range(duplicate_start_line, i + 1))
        in_duplicate_section = False
        duplicate_start_line = -1

# Create new content without duplicates
new_lines = []
for i, line in enumerate(lines):
    if i not in lines_to_remove:
        new_lines.append(line)

# Now update the schema reference in the remaining occurrence
result_lines = []
in_target_section = False
start_index = -1
end_index = -1

for i, line in enumerate(new_lines):
    if '*     summary: Update order status' in line and not in_target_section:
        in_target_section = True
        start_index = i
    elif in_target_section and line.strip() == ' */':
        end_index = i
        break

if start_index != -1 and end_index != -1:
    # Replace the schema part in the target section
    result_lines = new_lines[:start_index]
    
    # Add lines until we reach the schema definition
    for j in range(start_index, len(new_lines)):
        if 'requestBody:' in new_lines[j]:
            result_lines.append(new_lines[j])
            # Add the schema reference
            result_lines.append(' *       required: true\n')
            result_lines.append(' *       content:\n')
            result_lines.append(' *         application/json:\n')
            result_lines.append(' *           schema:\n')
            result_lines.append(' *             $ref: \'#/components/schemas/OrderStatusUpdate\'\n')
            # Skip the original schema definition until the end of the request body
            while j < len(new_lines) and 'responses:' not in new_lines[j]:
                j += 1
            # Add the response section
            result_lines.append(new_lines[j])
            break
        else:
            result_lines.append(new_lines[j])
    
    # Add the remaining lines
    result_lines.extend(new_lines[end_index:])
else:
    result_lines = new_lines

# Write the updated content back to the file
with open('/home/manager/Sync/floresya-v1/api/docs/openapi-annotations.js', 'w') as f:
    f.writelines(result_lines)

print("Duplicate removed and schema reference updated!")