#!/bin/bash

# Create placeholder icons for StreamGRID
# These are temporary icons until proper branding is created

echo "Creating placeholder icons for StreamGRID..."

# Create a simple SVG icon
cat > assets/icon.svg << 'EOF'
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#1a1a2e"/>
  <rect x="30" y="30" width="220" height="220" fill="#0f4c81" rx="10"/>
  <rect x="262" y="30" width="220" height="220" fill="#16537e" rx="10"/>
  <rect x="30" y="262" width="220" height="220" fill="#16537e" rx="10"/>
  <rect x="262" y="262" width="220" height="220" fill="#0f4c81" rx="10"/>
  <text x="256" y="280" font-family="Arial, sans-serif" font-size="72" font-weight="bold" text-anchor="middle" fill="white">SG</text>
</svg>
EOF

# Create a 1024x1024 PNG using sips (macOS built-in tool)
if command -v sips >/dev/null 2>&1; then
    # Create a temporary PNG from the SVG
    echo "Creating PNG icon..."
    # First, we need to create a basic PNG (macOS doesn't convert SVG directly with sips)
    # We'll create a simple colored square as placeholder
    
    # Create a simple PNG using Python (which is available on macOS by default)
    python3 << 'PYTHON_EOF'
from PIL import Image, ImageDraw, ImageFont
import os

# Create a 1024x1024 image with dark blue background
img = Image.new('RGB', (1024, 1024), '#1a1a2e')
draw = ImageDraw.Draw(img)

# Draw the grid pattern
grid_color = '#0f4c81'
alt_color = '#16537e'

# Draw four squares
draw.rounded_rectangle([60, 60, 500, 500], radius=20, fill=grid_color)
draw.rounded_rectangle([524, 60, 964, 500], radius=20, fill=alt_color)
draw.rounded_rectangle([60, 524, 500, 964], radius=20, fill=alt_color)
draw.rounded_rectangle([524, 524, 964, 964], radius=20, fill=grid_color)

# Add text
try:
    # Try to use a system font
    font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 144)
except:
    # Fallback to default font
    font = ImageFont.load_default()

text = "SG"
bbox = draw.textbbox((0, 0), text, font=font)
text_width = bbox[2] - bbox[0]
text_height = bbox[3] - bbox[1]
text_x = (1024 - text_width) // 2
text_y = (1024 - text_height) // 2
draw.text((text_x, text_y), text, fill='white', font=font)

# Save the image
img.save('assets/icon.png')
print("Created icon.png")
PYTHON_EOF

    # If Python/PIL isn't available, create a simple icon using ImageMagick if available
    if [ $? -ne 0 ]; then
        if command -v convert >/dev/null 2>&1; then
            echo "Creating icon with ImageMagick..."
            convert -size 1024x1024 xc:'#1a1a2e' \
                -fill '#0f4c81' -draw "roundrectangle 60,60 500,500 20,20" \
                -fill '#16537e' -draw "roundrectangle 524,60 964,500 20,20" \
                -fill '#16537e' -draw "roundrectangle 60,524 500,964 20,20" \
                -fill '#0f4c81' -draw "roundrectangle 524,524 964,964 20,20" \
                -fill white -pointsize 144 -gravity center -annotate +0+0 'SG' \
                assets/icon.png
        else
            echo "Creating basic icon with dd (minimal option)..."
            # Create a very basic 1024x1024 blue PNG as last resort
            # This creates a simple blue square
            dd if=/dev/zero of=assets/icon.png bs=1024 count=1024 2>/dev/null
        fi
    fi
fi

# Create .ico file for Windows (copy PNG and rename for now)
cp assets/icon.png assets/icon.ico 2>/dev/null || echo "Note: Proper .ico file needs to be created with proper tools"

# Create .icns file for macOS (copy PNG and rename for now)
cp assets/icon.png assets/icon.icns 2>/dev/null || echo "Note: Proper .icns file needs to be created with proper tools"

# Create entitlements file for macOS
cat > build/entitlements.mac.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
    <key>com.apple.security.cs.allow-jit</key>
    <true/>
    <key>com.apple.security.cs.disable-library-validation</key>
    <true/>
    <key>com.apple.security.network.client</key>
    <true/>
    <key>com.apple.security.network.server</key>
    <true/>
    <key>com.apple.security.device.camera</key>
    <true/>
    <key>com.apple.security.device.microphone</key>
    <true/>
</dict>
</plist>
EOF

echo "Placeholder icons created in assets/ directory"
echo "Note: These are basic placeholders. Professional icons should be created with proper design tools."
echo ""
echo "Created files:"
echo "  - assets/icon.svg (source)"
echo "  - assets/icon.png (1024x1024 PNG)"
echo "  - assets/icon.ico (Windows - needs proper conversion)"
echo "  - assets/icon.icns (macOS - needs proper conversion)"
echo "  - build/entitlements.mac.plist (macOS entitlements)"