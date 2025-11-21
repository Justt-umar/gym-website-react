# PWA Icons Required

To complete PWA setup, create these icon files:

## Required Icons

1. **pwa-icon-192.png** (192x192 pixels)
2. **pwa-icon-512.png** (512x512 pixels)

## How to Create

### Option 1: Use Online Tool
1. Visit https://favicon.io/favicon-converter/
2. Upload your gym logo
3. Select "Generate PWA Icons"
4. Download and extract to `/public/` folder

### Option 2: Manual Creation
1. Open your gym logo in image editor (Photoshop, GIMP, Canva)
2. Resize to 192x192 pixels → Save as `pwa-icon-192.png`
3. Resize to 512x512 pixels → Save as `pwa-icon-512.png`
4. Use transparent background for best results
5. Place both files in `/public/` folder

### Option 3: Use Emoji/Text
If you don't have a logo, use the 💪 emoji:
1. Visit https://twemoji-cheatsheet.vercel.app/
2. Download muscle emoji PNG
3. Resize to required dimensions
4. Save in `/public/` folder

## File Locations
```
/public/
  ├── pwa-icon-192.png  ← Create this
  ├── pwa-icon-512.png  ← Create this
  ├── manifest.json     ✓ Already created
  └── service-worker.js ✓ Already created
```

## Current Status
⚠️ PWA is set up but needs icon files to work fully.
The manifest.json references these icons but they don't exist yet.

## Testing PWA
After adding icons:
1. Build app: `npm run build`
2. Serve build: `npm run preview`
3. Open Chrome DevTools → Application → Manifest
4. Check if icons appear
5. Look for "Install App" button in address bar
