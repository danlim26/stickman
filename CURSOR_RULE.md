# Apple Human Interface Guidelines - Cursor Rule

## Design Philosophy
Design every aspect of the interface—layout, navigation controls, iconography, color schemes and animation—so it aligns with Apple's Human Interface Guidelines. Prioritize clarity and deference, use depth and subtle hierarchy to guide the user, and ensure all components feel intuitive, consistent and "Apple-like" in look and behavior.

## Core Principles

### 1. Clarity
- **Typography**: Use SF Pro Display for headings, SF Pro Text for body text
- **Hierarchy**: Clear visual hierarchy with proper spacing and sizing
- **Contrast**: High contrast ratios for accessibility
- **Legibility**: Text should be easily readable at all sizes

### 2. Deference
- **Content First**: UI elements should not compete with content
- **Subtle Design**: Use transparency and blur effects appropriately
- **Minimal Interference**: Controls should be available but not intrusive
- **Contextual Awareness**: UI adapts to content and user state

### 3. Depth
- **Layered Interface**: Use backdrop blur and shadows to create depth
- **Z-Index Hierarchy**: Proper layering of floating elements
- **Material Design**: Subtle shadows and elevation
- **Spatial Relationships**: Clear visual relationships between elements

## Visual Design System

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

/* Semantic Colors */
--success: #34c759;
--warning: #ff9500;
--error: #ff3b30;
--info: #007aff;
```

### Typography Scale
```css
/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */

/* Font Weights */
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Spacing System
```css
/* Spacing Scale */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

### Border Radius
```css
/* Border Radius Scale */
--radius-sm: 0.375rem;  /* 6px */
--radius-md: 0.5rem;    /* 8px */
--radius-lg: 0.75rem;   /* 12px */
--radius-xl: 1rem;      /* 16px */
--radius-2xl: 1.5rem;   /* 24px */
--radius-full: 9999px;
```

## Component Guidelines

### Buttons
```css
/* Primary Button */
.btn-primary {
  background: var(--apple-blue);
  color: white;
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-4);
  font-weight: var(--font-medium);
  transition: all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.btn-primary:hover {
  background: #0056cc;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* Secondary Button */
.btn-secondary {
  background: var(--apple-light-gray);
  color: var(--apple-dark-gray);
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-4);
  font-weight: var(--font-medium);
  transition: all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.btn-secondary:hover {
  background: #e5e5ea;
  transform: translateY(-1px);
}

/* Icon Button */
.btn-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1);
  background: transparent;
  color: var(--apple-gray);
}

.btn-icon:hover {
  background: var(--apple-light-gray);
  color: var(--apple-dark-gray);
  transform: scale(1.05);
}

.btn-icon.active {
  background: var(--apple-blue);
  color: white;
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
}
```

### Cards and Panels
```css
/* Floating Panel */
.floating-panel {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: var(--radius-2xl);
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 
    0 10px 25px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  padding: var(--space-4);
}

/* Modal */
.modal {
  background: white;
  border-radius: var(--radius-2xl);
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  padding: var(--space-6);
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
}
```

### Form Elements
```css
/* Input Fields */
.input {
  border: 1px solid var(--apple-border);
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-base);
  transition: all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1);
  background: white;
}

.input:focus {
  outline: none;
  border-color: var(--apple-blue);
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

/* Range Sliders */
.range-slider {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
}

.range-slider::-webkit-slider-track {
  background: var(--apple-border);
  height: 4px;
  border-radius: 2px;
}

.range-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  background: var(--apple-blue);
  height: 20px;
  width: 20px;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.range-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}
```

## Animation Guidelines

### Timing Functions
```css
/* Standard Apple Timing */
--ease-standard: cubic-bezier(0.4, 0.0, 0.2, 1);
--ease-decelerate: cubic-bezier(0.0, 0.0, 0.2, 1);
--ease-accelerate: cubic-bezier(0.4, 0.0, 1, 1);
--ease-sharp: cubic-bezier(0.4, 0.0, 0.6, 1);
```

### Duration Scale
```css
/* Animation Durations */
--duration-fast: 150ms;
--duration-normal: 300ms;
--duration-slow: 500ms;
--duration-slower: 700ms;
```

### Hover and Focus States
```css
/* Hover Effects */
.hover-lift {
  transition: transform 0.2s var(--ease-standard);
}

.hover-lift:hover {
  transform: translateY(-2px);
}

.hover-scale {
  transition: transform 0.2s var(--ease-standard);
}

.hover-scale:hover {
  transform: scale(1.05);
}

/* Focus States */
.focus-ring {
  transition: box-shadow 0.2s var(--ease-standard);
}

.focus-ring:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.3);
}
```

## Layout Guidelines

### Grid System
```css
/* Responsive Grid */
.grid-responsive {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-4);
}

/* Flexible Layout */
.flex-responsive {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
}
```

### Spacing Patterns
```css
/* Component Spacing */
.component-spacing > * + * {
  margin-top: var(--space-4);
}

/* Section Spacing */
.section-spacing {
  padding: var(--space-6) 0;
}

/* Container Spacing */
.container-padding {
  padding: var(--space-4);
}

@media (min-width: 768px) {
  .container-padding {
    padding: var(--space-6);
  }
}
```

## Accessibility Guidelines

### Focus Management
```css
/* Focus Indicators */
.focus-visible {
  outline: 2px solid var(--apple-blue);
  outline-offset: 2px;
}

/* Skip Links */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--apple-blue);
  color: white;
  padding: 8px;
  text-decoration: none;
  border-radius: var(--radius-md);
  z-index: 1000;
}

.skip-link:focus {
  top: 6px;
}
```

### Color Contrast
```css
/* High Contrast Mode Support */
@media (prefers-contrast: high) {
  .floating-panel {
    border: 2px solid black;
  }
  
  .btn-secondary {
    border: 1px solid black;
  }
}
```

## Mobile-First Design

### Touch Targets
```css
/* Minimum Touch Target Size */
.touch-target {
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### Responsive Breakpoints
```css
/* Breakpoint System */
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

## Implementation Checklist

### Visual Design
- [ ] Use Apple's color palette consistently
- [ ] Implement proper typography hierarchy
- [ ] Apply consistent border radius values
- [ ] Use appropriate spacing scale
- [ ] Implement backdrop blur effects
- [ ] Apply subtle shadows and depth

### Interaction Design
- [ ] Smooth transitions with Apple timing functions
- [ ] Proper hover and focus states
- [ ] Touch-friendly target sizes (44px minimum)
- [ ] Responsive design patterns
- [ ] Accessibility compliance

### Component Architecture
- [ ] Consistent button styles and states
- [ ] Proper form element styling
- [ ] Modal and overlay patterns
- [ ] Floating panel design
- [ ] Icon usage and sizing

### Performance
- [ ] Optimized animations (60fps)
- [ ] Efficient backdrop blur usage
- [ ] Proper z-index management
- [ ] Responsive image handling
- [ ] Touch event optimization

## Quality Assurance

### Visual Consistency
- [ ] All components follow the design system
- [ ] Color usage is consistent across the app
- [ ] Typography follows the established scale
- [ ] Spacing patterns are uniform
- [ ] Iconography is consistent

### User Experience
- [ ] Intuitive navigation patterns
- [ ] Clear visual hierarchy
- [ ] Appropriate feedback for user actions
- [ ] Smooth, responsive interactions
- [ ] Accessibility compliance

### Technical Implementation
- [ ] Clean, maintainable CSS
- [ ] Proper component structure
- [ ] Responsive design implementation
- [ ] Performance optimization
- [ ] Cross-browser compatibility
