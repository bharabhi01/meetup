# MapLibre GL Integration

This project uses **MapLibre GL JS** for interactive mapping functionality. MapLibre GL is an open-source library for publishing maps on the web, providing high-performance vector and raster map rendering.

## Features

- **Modern Vector Rendering**: Hardware-accelerated WebGL rendering for smooth performance
- **Custom Markers**: Color-coded markers for users and meeting points with interactive popups
- **Auto-fitting Bounds**: Automatically adjusts map view to show all markers
- **Responsive Design**: Optimized for all screen sizes with proper mobile controls
- **Free & Open Source**: No API keys required, uses OpenStreetMap tiles
- **Server-Side Rendering Safe**: Dynamically imported to avoid SSR issues

## Installation

The MapLibre GL package is already installed:

```bash
pnpm add maplibre-gl
```

## Implementation

### Map Component

Located at `components/ui/maplibre-map.tsx`, the component provides:

- **User Markers**: Coral (#FF6B6B) for user 1, teal (#4ECDC4) for user 2
- **Meeting Point**: Golden (#FFD93D) marker for the calculated midpoint
- **Interactive Popups**: Click markers to see user names and addresses
- **Navigation Controls**: Zoom in/out and compass controls
- **Responsive Layout**: Adapts to container size automatically

### Usage

```tsx
import { MapLibreMap } from "@/components/ui/maplibre-map"

<MapLibreMap
  user1={{
    name: "John Doe",
    address: "New York, NY",
    coordinates: { lat: 40.7128, lng: -74.006 }
  }}
  user2={{
    name: "Jane Smith", 
    address: "Brooklyn, NY",
    coordinates: { lat: 40.6782, lng: -73.9442 }
  }}
  midpoint={{ lat: 40.6955, lng: -73.9753 }}
  height="400px"
  className="rounded-lg"
/>
```

### Props

| Prop | Type | Description |
|------|------|-------------|
| `user1` | `User?` | First user with name, address, and coordinates |
| `user2` | `User?` | Second user with name, address, and coordinates |
| `midpoint` | `Coordinates?` | Meeting point coordinates |
| `height` | `string` | Map container height (default: "400px") |
| `className` | `string` | Additional CSS classes |

## Map Style

The map uses a custom style definition with OpenStreetMap raster tiles:

```json
{
  "version": 8,
  "sources": {
    "osm-tiles": {
      "type": "raster",
      "tiles": [
        "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png", 
        "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
      ],
      "tileSize": 256,
      "attribution": "© OpenStreetMap contributors"
    }
  },
  "layers": [
    {
      "id": "osm-tiles",
      "type": "raster", 
      "source": "osm-tiles"
    }
  ]
}
```

## Styling

Custom CSS is defined in `app/globals.css`:

```css
/* MapLibre GL Styles */
@import url("https://unpkg.com/maplibre-gl@5.6.0/dist/maplibre-gl.css");

/* Custom styling for controls, popups, and markers */
.maplibregl-ctrl-group button:hover {
  background: #f0f0f0 !important;
  color: #FF6B6B !important;
}
```

## Error Handling

The component includes comprehensive error handling:

- **Client-Side Only**: Uses `useState` to ensure browser-only rendering
- **Dynamic Imports**: MapLibre GL is imported asynchronously to avoid SSR issues
- **Container Validation**: Ensures proper dimensions before map initialization
- **Graceful Fallbacks**: Shows error states when map fails to load
- **Retry Functionality**: Users can retry loading if initialization fails

## Performance Features

- **Hardware Acceleration**: WebGL rendering for smooth performance
- **Efficient Markers**: DOM-based markers with CSS transforms for animations
- **Resize Handling**: ResizeObserver for responsive container changes
- **Memory Management**: Proper cleanup of maps and markers on unmount
- **Debounced Updates**: Prevents excessive re-renders during rapid changes

## Browser Support

MapLibre GL requires:
- WebGL support
- Modern browsers (Chrome 51+, Firefox 53+, Safari 10+)
- Hardware acceleration enabled (for optimal performance)

## Troubleshooting

### Map Not Loading
- Check browser console for WebGL errors
- Ensure internet connection for tile downloads
- Verify container has proper dimensions

### Markers Not Showing  
- Ensure coordinates are valid (lat: -90 to 90, lng: -180 to 180)
- Check that user objects have complete data
- Verify component props are passed correctly

### Performance Issues
- Enable hardware acceleration in browser
- Check for memory leaks with browser dev tools
- Ensure proper component cleanup

## Dependencies

- `maplibre-gl`: Core mapping library
- `@/lib/types`: TypeScript definitions for User and Coordinates
- React hooks: `useEffect`, `useRef`, `useState`, `useCallback`

## Attribution

Maps use OpenStreetMap data, which requires attribution:
- Data: © OpenStreetMap contributors
- Tiles: Provided by OpenStreetMap Foundation
- Library: MapLibre GL JS (BSD 3-Clause License) 