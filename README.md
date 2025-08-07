# Stickman Animator - Apple Human Interface Guidelines

A Progressive Web App for creating stickman animations with advanced drawing tools and frame-by-frame animation, designed following Apple's Human Interface Guidelines.

## 🎨 Design Philosophy

This application is built with Apple's Human Interface Guidelines in mind, prioritizing:

- **Clarity**: Clear visual hierarchy and intuitive navigation
- **Deference**: UI elements that don't compete with content
- **Depth**: Subtle shadows and backdrop blur effects for layered interfaces

## ✨ Features

### Core Animation Tools
- **Frame-by-frame animation** with onion skinning
- **Multiple drawing tools**: Brush, Eraser, Selection
- **Real-time preview** with customizable FPS
- **Export capabilities**: GIF, JSON, Video recording
- **Save/Load system** with local storage

### Apple-Style Interface
- **Floating panels** with backdrop blur effects
- **Touch-friendly controls** (44px minimum touch targets)
- **Smooth animations** with Apple timing functions
- **Responsive design** for all screen sizes
- **Accessibility support** with proper focus management

### Advanced Features
- **Color picker** with recent colors and presets
- **Brush size control** with visual feedback
- **Grid overlay** for precise drawing
- **Onion skinning** for frame reference
- **Selection tools** with copy/paste functionality

## 🎯 Design System

### Color Palette
```css
/* Primary Colors */
--apple-blue: #007aff;
--apple-red: #ff3b30;
--apple-green: #34c759;
--apple-orange: #ff9500;
--apple-purple: #af52de;
--apple-pink: #ff2d92;

/* Neutral Colors */
--apple-gray: #8e8e93;
--apple-light-gray: #f2f2f7;
--apple-dark-gray: #1c1c1e;
--apple-border: #d1d1d6;
```

### Typography Scale
- **Font Family**: SF Pro Display, SF Pro Text
- **Sizes**: 12px to 30px with consistent scaling
- **Weights**: Light (300) to Bold (700)

### Spacing System
- **Base unit**: 4px
- **Scale**: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px

### Border Radius
- **Small**: 6px
- **Medium**: 8px
- **Large**: 12px
- **Extra Large**: 16px
- **2XL**: 24px

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd stickman

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production
```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🎨 Component Architecture

### Button System
```css
/* Primary Button */
.btn-primary {
  background: var(--apple-blue);
  color: white;
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-4);
  font-weight: var(--font-medium);
  transition: all var(--duration-normal) var(--ease-standard);
}

/* Icon Button */
.btn-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--duration-normal) var(--ease-standard);
}
```

### Panel System
```css
/* Floating Panel */
.floating-panel {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: var(--radius-2xl);
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1);
}
```

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Touch Targets
- **Minimum size**: 44px × 44px
- **Spacing**: 8px between touch targets
- **Visual feedback**: Hover and active states

## ♿ Accessibility

### Features
- **Keyboard navigation** with proper focus management
- **Screen reader support** with ARIA labels
- **High contrast mode** support
- **Reduced motion** support for users with vestibular disorders
- **Touch-friendly** interface design

### Implementation
```css
/* Focus indicators */
.focus-ring:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.3);
}

/* High contrast support */
@media (prefers-contrast: high) {
  .floating-panel {
    border: 2px solid black;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 🎬 Animation Guidelines

### Timing Functions
```css
/* Standard Apple Timing */
--ease-standard: cubic-bezier(0.4, 0.0, 0.2, 1);
--ease-decelerate: cubic-bezier(0.0, 0.0, 0.2, 1);
--ease-accelerate: cubic-bezier(0.4, 0.0, 1, 1);
--ease-sharp: cubic-bezier(0.4, 0.0, 0.6, 1);
```

### Duration Scale
- **Fast**: 150ms
- **Normal**: 300ms
- **Slow**: 500ms
- **Slower**: 700ms

## 🛠️ Technical Stack

### Frontend
- **React 19** with TypeScript
- **Next.js 15** for SSR and routing
- **Tailwind CSS 4** for styling
- **Lucide React** for icons

### Animation & Drawing
- **HTML5 Canvas** for drawing
- **GIF.js** for GIF export
- **File Saver** for file downloads
- **React Color** for color picker

### PWA Features
- **Service Worker** for offline support
- **Web App Manifest** for app-like experience
- **Install prompts** for native app installation

## 📦 Project Structure

```
stickman/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── globals.css      # Global styles with Apple HIG
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Main page
│   ├── components/          # React components
│   │   ├── StickmanAnimator.tsx  # Main animation component
│   │   └── InstallPrompt.tsx     # PWA install prompt
│   └── types/               # TypeScript type definitions
├── public/                  # Static assets
├── CURSOR_RULE.md          # Apple HIG design guidelines
└── package.json            # Dependencies and scripts
```

## 🎯 Usage Examples

### Basic Drawing
1. Select the brush tool (default)
2. Choose a color from the color picker
3. Adjust brush size with the slider
4. Draw on the canvas

### Frame Animation
1. Draw your first frame
2. Click "Add Frame" to create a new frame
3. Enable onion skinning to see previous frame
4. Draw the next frame
5. Use the timeline to navigate between frames

### Export Options
- **GIF**: Export as animated GIF
- **JSON**: Save animation data
- **Video**: Record canvas as video
- **Local Storage**: Save animations locally

## 🔧 Customization

### Adding New Tools
```typescript
// Add new tool to the toolbar
const newTool = {
  icon: <NewIcon />,
  action: () => handleNewTool(),
  className: 'btn-icon touch-target'
};
```

### Custom Color Themes
```css
/* Override Apple colors for custom themes */
:root {
  --apple-blue: #your-custom-blue;
  --apple-red: #your-custom-red;
}
```

## 🧪 Testing

### Visual Testing
- Test on different screen sizes
- Verify touch targets are 44px minimum
- Check contrast ratios meet WCAG guidelines
- Test with reduced motion preferences

### Functionality Testing
- Test all drawing tools
- Verify frame navigation
- Check export functionality
- Test save/load system

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow Apple's Human Interface Guidelines
4. Test on multiple devices
5. Submit a pull request

## 📚 Resources

- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Web Content Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Progressive Web Apps](https://web.dev/progressive-web-apps/)

## 🎉 Acknowledgments

- Apple for the Human Interface Guidelines
- The React and Next.js communities
- All contributors to the open-source libraries used