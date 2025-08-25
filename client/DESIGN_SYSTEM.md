# BioVerse Design System

## 🎨 **Color Palette**

### Primary Colors
- **Background**: `bg-gray-950` (Main background)
- **Surface**: `bg-gray-900` (Secondary background)
- **Card**: `bg-gray-950/80` (Card backgrounds with transparency)

### Text Colors
- **Primary Text**: `text-gray-300` (All body text)
- **Accent Text**: `text-cyan-400` (Links and highlights)
- **Gradient Text**: `bg-gradient-to-r from-blue-400 via-cyan-500 to-emerald-600`

### Button Colors
- **Primary Button**: `from-charcoal-500 to-charcoal-600` (Consistent across all buttons)
- **Secondary Button**: `border-charcoal-600 text-gray-300`
- **Ghost Button**: `text-gray-300`

### Border Colors
- **Primary**: `border-gray-800`
- **Subtle**: `border-gray-700`
- **Light**: `border-gray-600`

## 📱 **Responsive Design**

### Breakpoints (Tailwind CSS)
- **Small**: `sm:` (640px+)
- **Medium**: `md:` (768px+) 
- **Large**: `lg:` (1024px+)
- **Extra Large**: `xl:` (1280px+)

### Grid System
- **Mobile**: Single column layouts
- **Tablet**: `md:grid-cols-2` for forms and cards
- **Desktop**: `lg:grid-cols-3` or `lg:grid-cols-4` for feature grids

## 🧩 **Components**

### ModernButton
- **Primary**: Charcoal gradient with subtle shadow
- **Variants**: primary, secondary, ghost, danger
- **Sizes**: sm, md, lg
- **Responsive**: Full width on mobile, auto width on desktop

### ModernInput
- **Background**: `bg-dark-input` (dark theme)
- **Text**: `text-gray-300`
- **Placeholder**: `placeholder-gray-400`
- **Focus**: Subtle charcoal ring

### ModernCard
- **Background**: `bg-gray-950/80` with backdrop blur
- **Border**: `border-gray-800`
- **Hover**: Subtle lift and border color change
- **Padding**: Configurable (sm, md, lg)

## ✨ **Animations & Effects**

### Micro-Interactions
- **Button Hover**: Scale 1.05, subtle shadow
- **Card Hover**: Lift (-1px translate) and border glow
- **Input Focus**: Subtle ring animation

### Background Effects
- **Gradient Orbs**: Floating animated gradients
- **Particles**: Subtle floating elements
- **Backdrop Blur**: Glassmorphism effects

## 📏 **Spacing & Typography**

### Spacing Scale
- **Component Padding**: 4, 6, 8 units
- **Section Padding**: py-24 (large sections)
- **Element Spacing**: space-y-6, gap-8

### Typography
- **Headings**: Font weights 700-900
- **Body**: `text-gray-300` with leading-relaxed
- **Labels**: `text-sm font-medium`
- **Links**: `text-cyan-400 hover:text-cyan-300`

## 🎯 **Usage Guidelines**

### Do's
✅ Use `text-gray-300` for all body text
✅ Use charcoal buttons for primary actions  
✅ Apply consistent border-radius (lg, xl)
✅ Use backdrop-blur for glass effects
✅ Follow responsive grid patterns

### Don'ts
❌ Mix different text colors arbitrarily
❌ Use bright colors without context
❌ Skip responsive breakpoints
❌ Use hard shadows (prefer subtle)
❌ Override component color schemes

## 🚀 **Implementation**

### New Components
When creating new components, follow these patterns:

```tsx
// Example component structure
const NewComponent = () => {
  return (
    <div className="bg-gray-950 text-gray-300">
      <ModernCard className="p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-300 mb-4">
          Title
        </h2>
        <p className="text-gray-300 leading-relaxed mb-6">
          Body text content
        </p>
        <ModernButton variant="primary" size="md">
          Action Button
        </ModernButton>
      </ModernCard>
    </div>
  );
};
```

### Responsive Patterns
```tsx
// Grid layouts
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  {/* Items */}
</div>

// Text sizing
<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
  Responsive Heading
</h1>

// Spacing
<div className="px-4 sm:px-6 lg:px-8 py-12 md:py-24">
  {/* Content */}
</div>
```

This design system ensures consistency, accessibility, and a premium feel across the entire BioVerse application.
