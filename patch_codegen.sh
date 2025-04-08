#!/bin/bash

RN_PODS_FILE="./node_modules/react-native/scripts/react_native_pods.rb"
CUSTOM_LINE="pod 'ReactCodegen', :path => \$CODEGEN_OUTPUT_DIR, :modular_headers => true"
FIX_FOLDER="./ios/react_codegen_fix"

echo "🔍 Checking for ReactCodegen auto pod entry in:"
echo "$RN_PODS_FILE"

# 1. Backup the original file first
if [ -f "$RN_PODS_FILE" ]; then
  cp "$RN_PODS_FILE" "${RN_PODS_FILE}.bak"
  echo "🗂️  Backup created: ${RN_PODS_FILE}.bak"
else
  echo "❌ File not found: $RN_PODS_FILE"
  exit 1
fi

# 2. Comment out the auto ReactCodegen line if not already commented
if grep -q "$CUSTOM_LINE" "$RN_PODS_FILE"; then
  echo "🛠️  Found auto-generated ReactCodegen line. Commenting it out..."
  sed -i '' "s|$CUSTOM_LINE|# $CUSTOM_LINE|" "$RN_PODS_FILE"
  echo "✅ Line commented out successfully."
else
  echo "✅ No unpatched ReactCodegen line found. You're good!"
fi

# 3. Check if the custom react_codegen_fix folder exists
echo "🔍 Verifying custom codegen folder..."
if [ -d "$FIX_FOLDER" ]; then
  echo "✅ Custom folder exists: $FIX_FOLDER"
else
  echo "⚠️  Missing folder: $FIX_FOLDER"
  echo "➡️  Please create it or copy your manual ReactCodegen podspec there."
  exit 1
fi

# 4. Reminder for Podfile config
echo ""
echo "📌 Reminder: Your Podfile should include this line inside the target block:"
echo "pod 'ReactCodegen', :path => './react_codegen_fix', :modular_headers => true"
echo ""

echo "🚀 Done! You can now safely run: pod install"
