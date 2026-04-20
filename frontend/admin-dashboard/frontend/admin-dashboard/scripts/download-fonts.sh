#!/bin/bash
cd "$(dirname "$0")/.." || exit
mkdir -p public/fonts

# Download DM Serif Display
curl -L "https://fonts.gstatic.com/s/dmserifdisplay/v15/-nFnOHM81r4j6k0gjAW3mujVU2B2G_5x0vrx52jJ3Q.woff2" -o public/fonts/dm-serif-display-regular.woff2

# Download DM Sans
curl -L "https://fonts.gstatic.com/s/dmsans/v15/rP2Yp2ywxg089UriI5-g4vlH9VoD8Cmcqbu0-K4.woff2" -o public/fonts/dm-sans-regular.woff2
curl -L "https://fonts.gstatic.com/s/dmsans/v15/rP2Yp2ywxg089UriI5-g4vlH9VoD8Cmcqbu0-K6z9mXg.woff2" -o public/fonts/dm-sans-medium.woff2
curl -L "https://fonts.gstatic.com/s/dmsans/v15/rP2Yp2ywxg089UriI5-g4vlH9VoD8Cmcqbu0-K4.woff2" -o public/fonts/dm-sans-light.woff2

# Download DM Mono
curl -L "https://fonts.gstatic.com/s/dmmono/v14/aFTU7PB1QTsUX8KYthqQBK6P3EXw.woff2" -o public/fonts/dm-mono-regular.woff2

echo "Fonts downloaded to public/fonts/"
