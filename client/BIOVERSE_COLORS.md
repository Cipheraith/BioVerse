# 🧬 BioVerse Color System

## Overview
The new BioVerse color system is designed for a modern, medical/scientific UI with consistent branding across all components. All buttons, inputs, and interactive elements use the same primary teal color for perfect consistency.

## Primary Colors

### 🌊 BioVerse Teal (Primary)
- **Main Color**: `#26b5b0` (bioverse-500 / primary-500)
- **Usage**: ALL buttons, primary interactions, brand elements, focus states
- **Hover States**: Darker variations (`#1d9891`, `#1a7c77`)
- **Light States**: Lighter variations (`#79ddd9`, `#40c9c4`)

### 🔵 Deep Scientific Blue (Secondary)
- **Main Color**: `#3366ff` (deepblue-500 / secondary-500)
- **Usage**: Accent elements, secondary buttons, informational states
- **Complementary to primary teal**

### 💜 Scientific Purple (Accent)
- **Main Color**: `#8b5cf6` (accent-500)
- **Usage**: Highlights, special effects, tertiary elements

## Status Colors

### ✅ Success
- **Color**: `#10b981` (success-500)
- **Usage**: Success messages, positive states, confirmations

### ❌ Danger/Error
- **Color**: `#f43f5e` (danger-500)
- **Usage**: Error messages, delete buttons, critical alerts

### ⚠️ Warning
- **Color**: `#eab308` (warning-500)
- **Usage**: Warning messages, cautionary states

### ℹ️ Info
- **Color**: `#3366ff` (info-500) - Same as secondary for consistency
- **Usage**: Information messages, help text

## Dark Mode Colors

### Backgrounds
- **Main**: `#000000` (Pure black)
- **Secondary**: `#0a1a1a` (Very dark teal-tinted black)
- **Cards**: `#121c20` (Card background with teal tint)
- **Surfaces**: `#1a2428` (Surface elements)

### Text Colors
- **Primary**: `#ffffff` (Pure white)
- **Secondary**: `#ecfeff` (Teal-tinted white)
- **Muted**: `#d1e5e7` (Subtle teal-tinted muted)

### Borders
- **Default**: `#1d3538` (Teal-tinted borders)
- **Light**: `#274950` (Lighter teal-tinted borders)

## Usage Guidelines

### ✅ DO:
- Use `primary-500` (#26b5b0) for ALL buttons
- Use consistent focus states with primary color
- Apply BioVerse teal to hover effects
- Use teal-tinted dark backgrounds for cohesive feel
- Apply status colors only for their specific purposes

### ❌ DON'T:
- Mix different button colors (all should be teal)
- Use random colors not in the system
- Override primary color for non-brand elements
- Use bright colors for backgrounds

## Responsive Considerations

### Mobile (≤ 640px)
- Minimum touch target: 44px (iOS standard)
- Increased button padding: `0.75rem 1.5rem`
- Same colors but optimized spacing

### Tablet (≤ 768px)  
- Minimum touch target: 48px
- Button padding: `1rem 2rem`
- Consistent color scheme across breakpoints

### Desktop (≥ 1024px)
- Full hover effects with teal glows
- Enhanced animations with BioVerse colors
- Rich particle effects using color palette

## Implementation Examples

### Button (Always use primary teal)
```tsx
<ModernButton variant="primary">
  Sign In
</ModernButton>
```

### Input Focus State
```css
.input:focus {
  border-color: #26b5b0;
  box-shadow: 0 0 0 3px rgba(38, 181, 176, 0.3);
}
```

### Success Alert
```tsx
<ModernAlert type="success" message="Profile saved successfully!" />
```

### Gradient Text
```css
.bioverse-gradient-text {
  background: linear-gradient(135deg, #26b5b0, #3366ff, #8b5cf6);
}
```

## Color Values Reference

| Name | Variable | Hex | Usage |
|------|----------|-----|--------|
| BioVerse Teal | `primary-500` | `#26b5b0` | All buttons, primary interactions |
| Deep Blue | `secondary-500` | `#3366ff` | Secondary elements, info states |
| Scientific Purple | `accent-500` | `#8b5cf6` | Accent highlights |
| Success Green | `success-500` | `#10b981` | Success states |
| Danger Red | `danger-500` | `#f43f5e` | Error states |
| Warning Yellow | `warning-500` | `#eab308` | Warning states |

## Browser Support
- Supports all modern browsers
- Includes fallbacks for older browsers
- CSS custom properties with fallback values
- Progressive enhancement for advanced features

This color system ensures a cohesive, professional, and accessible user interface across all BioVerse applications.
