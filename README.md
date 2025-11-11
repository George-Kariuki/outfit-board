# OutfitBoard - Adalo Custom Component

A canvas-based outfit builder component. Enables users to drag, resize, rotate, and arrange wardrobe images on a board that can be exported as a PNG collage.

## Setup Instructions

### 1. Create the component

```bash
npx create-adalo-component outfit-board
cd outfit-board
```

### 2. Install dependencies

```bash
npm install
```

### 3. Login with Adalo account

```bash
npx adalo login
```

### 4. Start dev server

```bash
npx adalo dev
```

After running `adalo dev`, the component appears under **Components → Development** inside the Adalo editor.

## Component Features

- ✅ Add multiple images from wardrobe
- ✅ Drag and reposition items
- ✅ Resize with corner handles
- ✅ Rotate items
- ✅ Adjust opacity/transparency
- ✅ Change layer order (bring forward/send backward)
- ✅ Delete items
- ✅ Export board to PNG
- ✅ Save/load board state (JSON)
- ✅ Snap-to-grid option
- ✅ Fully configurable styling

## Props

| Prop | Type | Description |
|------|------|-------------|
| `inputImages` | list | List of images from wardrobe |
| `initialState` | text | Board JSON to preload state |
| `boardWidth` | number | Canvas width (default: 350) |
| `boardHeight` | number | Canvas height (default: 450) |
| `backgroundColor` | color | Canvas background color |
| `gridEnabled` | boolean | Toggle grid overlay |
| `gridSize` | number | Size of grid cells |
| `exportTrigger` | boolean | When toggled, exports board |
| `onExport` | action | Returns base64 PNG string |
| `onStateChange` | action | Returns board JSON state |

## Child Components: Styling

Configure visual appearance through the Styling child component:

- **Toolbar Color**: Color of the floating toolbar
- **Handle Color**: Color of resize/rotation handles
- **Selection Outline Color**: Color of selection border
- **Shadow Enabled**: Toggle shadows on items
- **Rotation Handle Shape**: "circle" or "square"

## Usage in Adalo

1. Drag the OutfitBoard component into your screen
2. Connect `inputImages` to a list of images (e.g., from a collection)
3. Configure board dimensions and styling
4. Set up workflows:
   - Connect `onExport` to save/download the exported PNG
   - Connect `onStateChange` to save board state to your database
5. Toggle `exportTrigger` to trigger exports (e.g., from a button action)

## Export Functionality

The component uses `html2canvas` to export the board. When `exportTrigger` changes from `false` to `true`, it:
1. Captures the board as a canvas
2. Converts to base64 PNG
3. Triggers `onExport` action with the base64 string
4. Resets the trigger to prevent re-export

## State Management

Board state is automatically saved as JSON whenever items are modified. The state structure:

```json
[
  {
    "id": "item-123",
    "src": "image-url",
    "x": 50,
    "y": 50,
    "width": 120,
    "height": 120,
    "rotation": 0,
    "opacity": 1,
    "zIndex": 1
  }
]
```

Load a saved state by passing JSON string to `initialState` prop.

## Cross-Platform Support

- ✅ Web (desktop and mobile)
- ✅ iOS native
- ✅ Android native

The component uses pointer events for consistent behavior across platforms and gracefully handles `html2canvas` limitations on mobile web.

## Building for Production

```bash
npx adalo build
```

## Author

George Kariuki

