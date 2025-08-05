# Stickman Animator PWA

A Progressive Web App built with Next.js for creating stickman animations with advanced drawing tools and frame-by-frame animation capabilities.

## Features

### Drawing Tools
- **Brush Tool**: Draw with adjustable brush size (1-10px)
- **Eraser Tool**: Remove drawings with a larger eraser radius
- **Selection Tool**: Select, move, copy, and paste drawing elements
- **Drag & Drop**: Move selected parts around the canvas

### Animation Features
- **Frame Management**: Add, duplicate, delete, and clear frames
- **Timeline Navigation**: Visual timeline with frame thumbnails
- **Onion Skinning**: See previous/next frames as guides (red/blue overlay)
- **Playback Controls**: Play, pause, stop animation
- **Adjustable FPS**: Control animation speed (1-24 FPS)

### Pre-built Content
- **Add Stickman**: Quickly insert a basic stick figure
- **Sword Fight Demo**: Pre-made 8-frame sword fighting animation

### PWA Features
- **Offline Support**: Works without internet connection
- **Mobile Responsive**: Optimized for touch devices
- **Install Prompt**: Can be installed as an app on mobile/desktop
- **Service Worker**: Caches resources for offline use

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd stickman
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## How to Use

### Basic Drawing
1. Click and drag on the canvas to draw
2. Adjust brush size with the slider
3. Use the eraser tool to remove parts
4. Enable "Onion Skin" to see adjacent frames

### Animation Workflow
1. Draw your first frame
2. Click "Add Frame" to create a new frame
3. Draw the next pose/position
4. Repeat for more frames
5. Use the timeline to navigate between frames
6. Click "Play" to see your animation

### Advanced Features
- **Select Mode**: Drag to select parts, then move them around
- **Copy/Paste**: Select elements, copy them, and paste to duplicate
- **Duplicate Frame**: Copy entire frames for slight modifications
- **Sword Fight Demo**: See a complex animation example

## Technology Stack

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Beautiful icons
- **next-pwa**: Progressive Web App functionality
- **HTML5 Canvas**: High-performance drawing

## File Structure

```
src/
├── app/
│   ├── layout.tsx          # PWA metadata and service worker
│   ├── page.tsx            # Main page with Stickman Animator
│   ├── globals.css         # Global styles
│   └── sw-register.tsx     # Service worker registration
├── components/
│   └── StickmanAnimator.tsx # Main animation component
public/
├── manifest.json           # PWA manifest
├── browserconfig.xml       # Windows tile configuration
└── icons/                  # PWA icons (placeholder)
```

## Browser Support

- Chrome/Edge 88+
- Firefox 84+
- Safari 14+
- Mobile browsers with PWA support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for learning or commercial purposes.