# Toast/Message Usage Guide

This project now uses Ant Design's built-in `message` component for displaying toast notifications instead of the custom Toast component.

## How to Use

### Import the toast utility

```typescript
import { toast } from '../utils/useToast';
```

### Available Toast Types

```typescript
// Success message (green)
toast.success('Operation completed successfully!');

// Error message (red)
toast.error('Something went wrong!');

// Warning message (yellow/orange)
toast.warning('Please be careful with this action.');

// Info message (blue)
toast.info('Here is some information for you.');
```

### Custom Duration

By default, messages auto-dismiss after 3 seconds. You can customize this:

```typescript
toast.success('This message will show for 5 seconds', 5);
toast.error('This error will persist for 10 seconds', 10);
```

### Using the Hook (Alternative)

You can also use the `useToast` hook:

```typescript
import { useToast } from '../utils/useToast';

const MyComponent = () => {
  const { showToast } = useToast();
  
  const handleClick = () => {
    showToast('success', 'Operation completed!');
  };
  
  return <button onClick={handleClick}>Click me</button>;
};
```

## Benefits of Ant Design Message

- **Consistent Design**: Matches Ant Design's design system
- **Better Performance**: Optimized rendering and animations
- **Accessibility**: Built-in accessibility features
- **Less Code**: No need to manage state for toast visibility
- **Multiple Messages**: Can show multiple messages simultaneously
- **Customizable**: Easy to customize appearance and behavior

## Migration from Custom Toast

The old custom Toast component has been removed. Replace:

```typescript
// Old way
<Toast
  isVisible={showToast}
  onClose={() => setShowToast(false)}
  type="success"
  title="Success!"
  message="Operation completed"
  duration={3000}
/>
```

With:

```typescript
// New way
toast.success('Operation completed');
```

The new approach is much simpler and doesn't require managing toast state in your components.
