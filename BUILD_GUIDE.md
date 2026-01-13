# Complete Guide: Building an Adalo Custom Component

This guide documents the complete process of building the **OutfitBoard** Adalo component, from initial setup to publishing. Use this as a reference template for building your own Adalo components.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Project Structure](#project-structure)
4. [Dependencies & Libraries](#dependencies--libraries)
5. [Configuration Files](#configuration-files)
6. [Component Implementation](#component-implementation)
7. [Key Patterns & Best Practices](#key-patterns--best-practices)
8. [Testing](#testing)
9. [Publishing](#publishing)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Adalo account
- Git (for version control)

---

## Initial Setup

### Step 1: Create the Component

```bash
# Create a new Adalo component
npx create-adalo-component outfit-board

# Navigate to the component directory
cd outfit-board
```

This command creates the basic Adalo component structure with:
- `package.json` - Node.js dependencies
- `adalo.json` - Adalo library configuration
- `src/components/` - Component source files
- Basic webpack configuration

### Step 2: Login to Adalo

```bash
# Login with your Adalo account
npx adalo login
```

This authenticates you with Adalo's CLI and saves credentials to `~/.adalorc`.

### Step 3: Install Dependencies

```bash
# Install all dependencies
npm install

# Install additional libraries (if needed)
npm install react-konva konva use-image --legacy-peer-deps
```

**Note:** Use `--legacy-peer-deps` flag if you encounter peer dependency conflicts with React versions.

---

## Project Structure

The final project structure should look like this:

```
outfit-board/
├── package.json                 # Node.js dependencies and scripts
├── adalo.json                    # Adalo library metadata
├── webpack.config.js             # (Optional) Custom webpack config
├── .babelrc                      # Babel configuration
├── .gitignore                    # Git ignore rules
├── README.md                     # Component documentation
├── scripts/
│   ├── install_ios.js           # iOS install script (JavaScript)
│   └── install_android.js       # Android install script (JavaScript)
└── src/
    └── components/
        └── OutfitBoard/
            ├── manifest.json     # Component props and configuration
            ├── index.js          # Main component (platform detection)
            ├── OutfitBoard.web.js # Web-specific implementation
            ├── Styles.js         # Styling (web-compatible)
            ├── icon.png          # Component icon (90x90px minimum)
            └── example-thumbnail.png
```

---

## Dependencies & Libraries

### Core Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-konva": "^18.2.14",    // React wrapper for Konva canvas
    "konva": "^9.3.22",           // 2D canvas library
    "use-image": "^1.1.4"         // Hook for loading images in React
  }
}
```

### Why These Libraries?

1. **react-konva**: Provides React bindings for Konva.js, allowing canvas manipulation with React components
2. **konva**: Powerful 2D canvas library for drag, resize, rotate operations
3. **use-image**: React hook that handles image loading with proper error handling

### Dev Dependencies

```json
{
  "devDependencies": {
    "@adalo/cli": "^1.0.6",       // Adalo CLI tools
    "react-art": "^16.13.1",      // Required by react-native-web
    "react-native-web": "^0.9.13" // Web compatibility layer
  }
}
```

---

## Configuration Files

### 1. package.json

**Key Properties:**
- `name`: Component name (kebab-case, unique)
- `version`: Semantic versioning (1.0.0, 1.0.1, etc.)
- `main`: Entry point (usually "index.js")
- `author`: Your name/company
- `scripts`: Adalo CLI commands

**Example:**
```json
{
  "name": "outfit-board",
  "version": "1.0.3",
  "main": "index.js",
  "author": "Your Name",
  "scripts": {
    "dev": "adalo dev",
    "build": "adalo build",
    "publish": "adalo publish"
  }
}
```

### 2. adalo.json

**Required Properties:**
- `displayName`: Name shown in Adalo editor
- `author`: Author name
- `description`: Short description
- `supportURL`: Support/contact URL
- `demoAppURL`: Preview app URL (use placeholder if not ready)
- `requiresThirdPartySubscription`: Boolean
- `components`: Array of component definitions

**Example:**
```json
{
  "displayName": "Outfit Board",
  "author": "Your Name",
  "description": "Canvas-based outfit builder component.",
  "supportURL": "https://github.com/your-username/outfit-board",
  "demoAppURL": "https://preview.adalo.com/example-id/screens",
  "requiresThirdPartySubscription": false,
  "components": [
    {
      "name": "OutfitBoard",
      "manifest": "./src/components/OutfitBoard/manifest.json"
    }
  ]
}
```

### 3. manifest.json

**Key Sections:**

1. **Base Properties:**
   - `displayName`: Component name
   - `defaultWidth` / `defaultHeight`: Default dimensions
   - `resizeX` / `resizeY`: Allow resizing
   - `icon`: Path to icon image

2. **Props:**
   - `name`: Prop identifier (camelCase)
   - `displayName`: User-friendly name
   - `type`: Data type (text, number, boolean, color, list, image, action)
   - `role`: Purpose (data, style, trigger, action)
   - `default`: Default value

3. **Child Components:**
   - Optional nested components for styling/configuration

**Example:**
```json
{
  "displayName": "OutfitBoard",
  "defaultWidth": 640,
  "defaultHeight": 480,
  "resizeX": true,
  "resizeY": true,
  "icon": "./icon.png",
  "props": [
    {
      "name": "inputImages",
      "displayName": "Input Images",
      "type": "list",
      "role": "data",
      "default": []
    },
    {
      "name": "onExport",
      "displayName": "On Export",
      "type": "action",
      "role": "action"
    }
  ]
}
```

---

## Component Implementation

### Architecture Pattern

Following the **Adalo ImageSlider** pattern:

1. **Main Component** (`index.js`):
   - Platform detection (web vs mobile)
   - Routes to platform-specific implementation
   - Uses React Native components for mobile

2. **Web Implementation** (`OutfitBoard.web.js`):
   - Uses React Konva for canvas
   - Handles web-specific interactions
   - Uses standard HTML elements where needed

3. **Mobile Implementation** (in `index.js`):
   - Uses React Native components
   - Fallback UI for native platforms

### Key Implementation Patterns

#### 1. Platform Detection

```javascript
isWeb = () => {
  return Platform.OS === 'web' || 
         (Platform.OS !== 'ios' && Platform.OS !== 'android');
};
```

#### 2. Image Data Normalization

**Critical Pattern:** Adalo passes images in various formats. Always normalize:

```javascript
function normalizeImageValue(img) {
  if (!img && img !== 0) return null;

  // String URL
  if (typeof img === 'string') {
    return { rnSource: { uri: img }, url: img };
  }

  // React Native source object
  if (typeof img === 'object' && img.uri) {
    return { rnSource: img, url: img.uri };
  }

  // Nested Adalo format: { image: { uri: '...' } }
  if (img.image && img.image.uri) {
    return { rnSource: { uri: img.image.uri }, url: img.image.uri };
  }

  // Local require (number)
  if (typeof img === 'number') {
    return { rnSource: img, url: null };
  }

  return null;
}
```

**Why This Matters:**
- React Native `<Image>` expects `{ uri: '...' }` or `require()` number
- Don't double-wrap: `source={{ uri: { uri: '...' } }}` ❌
- Use normalized source directly: `source={normalized.rnSource}` ✅

#### 3. Component Data Handling

**For Lists:**
```javascript
// Adalo passes arrays directly
const { inputImages } = this.props;
// inputImages is an array of image objects
```

**For Actions:**
```javascript
// Actions are functions
const { onExport } = this.props;
if (onExport) {
  onExport(data);
}
```

**For Form Values (Component Data):**
```javascript
// If prop has role: "formValue"
const { exampleFormValue } = this.props;
// Returns: { value, onChange, initial }
// Use: exampleFormValue.value and exampleFormValue.onChange(newValue)
```

#### 4. State Management

```javascript
class OutfitBoard extends Component {
  state = {
    items: [],
    selectedItemId: null,
    boardName: '',
  };

  // Update state immutably
  updateItem = (id, updates) => {
    this.setState(prevState => ({
      items: prevState.items.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    }));
  };
}
```

#### 5. React Konva Integration

```javascript
import { Stage, Layer, Image as KonvaImage, Transformer, Group } from 'react-konva';
import useImage from 'use-image';

const URLImage = ({ item, onTransformEnd }) => {
  const [image] = useImage(item.src); // Load image
  
  return (
    <Group
      x={item.x}
      y={item.y}
      draggable
      onDragEnd={(e) => {
        onTransformEnd({ ...item, x: e.target.x(), y: e.target.y() });
      }}
    >
      <KonvaImage image={image} width={item.width} height={item.height} />
    </Group>
  );
};
```

---

## Key Patterns & Best Practices

### 1. Image Handling

**DO:**
- Normalize all image inputs
- Store both `rnSource` (for native) and `url` (for web/Konva)
- Use `normalized.rnSource` directly in React Native `<Image>`
- Use `normalized.url` for web `<img>` tags and Konva

**DON'T:**
- Don't double-wrap image sources
- Don't assume all images are strings
- Don't use `<img>` tags in React Native code

### 2. Component Lifecycle

**componentDidMount:**
- Initialize state from props
- Log incoming data for debugging
- Set up initial values

**componentDidUpdate:**
- Use robust change detection (compare content, not just references)
- Handle prop updates carefully
- Avoid infinite update loops

```javascript
// Robust change detection
const imagesChanged = 
  (!inputImages && prevProps.inputImages) ||
  (inputImages && !prevProps.inputImages) ||
  (inputImages && prevProps.inputImages && (
    inputImages.length !== prevProps.inputImages.length ||
    inputImages.some((img, idx) => {
      const prevImg = prevProps.inputImages[idx];
      return normalizeImageValue(img)?.url !== normalizeImageValue(prevImg)?.url;
    })
  ));
```

### 3. Cross-Platform Compatibility

- Use React Native components (`View`, `Text`, `Image`, `TouchableOpacity`)
- Use `Platform.OS` for platform-specific code
- Create separate `.web.js` files for web-specific implementations
- Test on both web and mobile

### 4. Styling

**For Web:**
- Use plain JavaScript objects (not StyleSheet)
- Use standard CSS properties (camelCase)
- Use `styled-components` if needed (but be careful with React Native compatibility)

**For Mobile:**
- Use `StyleSheet.create()` from React Native
- Use React Native style properties
- Avoid web-only CSS

### 5. Error Handling

```javascript
// Always wrap JSON parsing
try {
  const parsed = JSON.parse(initialState);
  if (Array.isArray(parsed)) {
    this.setState({ items: parsed });
  }
} catch (e) {
  console.error('Failed to parse initialState:', e);
}

// Validate before using
if (!normalized || !normalized.url) return null;
```

---

## Testing

### Development Mode

```bash
# Start the dev server
npx adalo dev
```

**What happens:**
- Webpack compiles your component
- Creates local servers (usually ports 8001, 8002)
- Component appears in Adalo editor under **Components → Development**
- Changes hot-reload automatically

### Testing Checklist

- [ ] Component appears in Adalo editor
- [ ] Props are configurable in editor
- [ ] Images load correctly from database
- [ ] Actions trigger properly
- [ ] Component data updates correctly
- [ ] Works on web preview
- [ ] Works on mobile preview (if applicable)
- [ ] Export functionality works
- [ ] State save/load works

### Debugging Tips

1. **Console Logging:**
   ```javascript
   console.log('inputImages:', JSON.stringify(inputImages, null, 2));
   ```

2. **Check Browser Console:**
   - Open Adalo editor
   - Open browser DevTools (F12)
   - Check Console tab for errors

3. **Inspect Props:**
   - Log all props in `componentDidMount`
   - Verify data structure matches expectations

---

## Publishing

### Pre-Publishing Checklist

- [ ] All required files present (icon.png, logo.png)
- [ ] `package.json` has correct version
- [ ] `adalo.json` has all required fields
- [ ] No console errors
- [ ] Component tested in dev mode
- [ ] Install scripts are JavaScript (not shell scripts)

### Publishing Steps

```bash
# 1. Update version in package.json
# 2. Build the component
npx adalo build

# 3. Publish (will prompt for public/private)
npx adalo publish
```

### Version Management

Follow semantic versioning:
- **Patch** (1.0.0 → 1.0.1): Bug fixes
- **Minor** (1.0.0 → 1.1.0): New features, backward compatible
- **Major** (1.0.0 → 2.0.0): Breaking changes

### Publishing Requirements

**Must Have:**
- `name`, `version`, `author`, `description` in package.json
- `displayName`, `author`, `description` in adalo.json
- `supportURL` for public components
- `requiresThirdPartySubscription` boolean

**For Paid Components:**
- `price` property
- `demoAppURL` property

---

## Troubleshooting

### Common Issues

#### 1. Component Not Showing in Editor

**Solutions:**
- Check `adalo dev` is running
- Verify component name in `adalo.json` matches directory
- Check for compilation errors in terminal
- Restart `adalo dev`

#### 2. Images Not Loading

**Solutions:**
- Check image normalization function
- Log `inputImages` to see actual data structure
- Verify image URLs are accessible
- Check CORS settings for external images

#### 3. Build/Publish Errors

**Solutions:**
- Ensure all required files exist (icon.png, logo.png)
- Check install scripts are `.js` not `.sh`
- Verify `adalo.json` has all required fields
- Check for syntax errors in code

#### 4. Peer Dependency Conflicts

**Solutions:**
- Use `--legacy-peer-deps` flag when installing
- Check React version compatibility
- Update `@adalo/cli` to latest version

---

## Reference Documentation

### Official Adalo Docs

- [Getting Started](https://developers.adalo.com/docs/basics/introduction)
- [Component Configuration](https://developers.adalo.com/docs/configuration/manifest-json)
- [Actions](https://developers.adalo.com/docs/interactions/actions)
- [Component Data](https://developers.adalo.com/docs/interactions/component-data)
- [Files and Images](https://developers.adalo.com/docs/interactions/files-and-images)
- [Publishing](https://developers.adalo.com/docs/workflow/publishing)

### Reference Repositories

- [Adalo ImageSlider](https://github.com/AdaloHQ/image-slider) - Excellent example of cross-platform component
- [Adalo Component Examples](https://github.com/AdaloHQ) - Browse other official components

### Key Libraries Documentation

- [React Konva](https://konvajs.org/docs/react/) - React bindings for Konva
- [Konva.js](https://konvajs.org/) - 2D canvas library
- [React Native](https://reactnative.dev/docs/getting-started) - Cross-platform components

---

## Summary of Tools & Commands

### Adalo CLI Commands

```bash
npx adalo login          # Authenticate with Adalo
npx adalo dev            # Start development server
npx adalo build          # Build for production
npx adalo publish        # Publish to Adalo marketplace
```

### NPM Commands

```bash
npm install              # Install dependencies
npm install <package> --legacy-peer-deps  # Install with peer deps override
npm run dev              # Alias for adalo dev
npm run build            # Alias for adalo build
```

### Git Commands

```bash
git init                 # Initialize repository
git add .                # Stage all changes
git commit -m "message"  # Commit changes
git push origin main     # Push to GitHub
```

---

## Best Practices Summary

1. **Always normalize image data** - Adalo provides images in various formats
2. **Use platform detection** - Separate web and mobile implementations
3. **Store both formats** - Keep `rnSource` for native and `url` for web
4. **Robust change detection** - Compare content, not just references
5. **Error handling** - Wrap JSON parsing and validate data
6. **Console logging** - Log incoming props for debugging
7. **Follow ImageSlider pattern** - Use as reference for structure
8. **Test thoroughly** - Test on web and mobile before publishing
9. **Version properly** - Use semantic versioning
10. **Document everything** - Keep README and code comments updated

---

## Quick Start Template

For a new component, follow this structure:

1. `npx create-adalo-component my-component`
2. Update `package.json` with dependencies
3. Configure `adalo.json` with metadata
4. Create `manifest.json` with props
5. Implement `index.js` with platform detection
6. Create `.web.js` for web implementation
7. Add `normalizeImageValue` helper for images
8. Test with `npx adalo dev`
9. Publish with `npx adalo publish`

---

**Built by:** George Kariuki  
**Component:** OutfitBoard v1.0.3  
**Repository:** https://github.com/George-Kariuki/outfit-board

