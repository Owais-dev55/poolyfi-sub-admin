# React Toastify Usage Guide

This project now uses **React Toastify** for displaying toast notifications. React Toastify is a lightweight, customizable, and feature-rich toast library.

## 🚀 Features

- **Multiple toast types**: success, error, warning, info
- **Promise-based toasts**: Perfect for async operations
- **Customizable**: Position, duration, styling, animations
- **Accessible**: Built-in accessibility features
- **Lightweight**: Small bundle size
- **Rich API**: Many configuration options

## 📦 Installation

```bash
npm install react-toastify
```

## 🎯 Basic Usage

### Import the utility

```typescript
import { toastify } from '../utils/useToastify';
```

### Simple Toast Types

```typescript
// Success toast (green)
toastify.success('Operation completed successfully!');

// Error toast (red)
toastify.error('Something went wrong!');

// Warning toast (yellow/orange)
toastify.warning('Please be careful with this action.');

// Info toast (blue)
toastify.info('Here is some information for you.');
```

### Custom Options

```typescript
// Custom duration (default is 3000ms)
toastify.success('This will show for 5 seconds', { autoClose: 5000 });

// Custom position
toastify.info('Bottom right message', { position: 'bottom-right' });

// No auto-close
toastify.warning('Important message', { autoClose: false });

// Custom styling
toastify.success('Styled message', {
  style: {
    background: '#4CAF50',
    color: 'white',
    fontSize: '16px'
  }
});
```

## 🔄 Promise-Based Toasts

Perfect for async operations:

```typescript
const fetchData = async () => {
  const promise = fetch('/api/data');
  
  toastify.promise(promise, {
    pending: 'Loading data...',
    success: 'Data loaded successfully!',
    error: 'Failed to load data!'
  });
};

// Or with custom messages
toastify.promise(myPromise, {
  pending: 'Saving...',
  success: {
    render: ({ data }) => `Saved: ${data.name}`,
    autoClose: 2000
  },
  error: {
    render: ({ data }) => `Error: ${data.message}`,
    autoClose: 5000
  }
});
```

## 🎨 Advanced Usage

### Custom Toast

```typescript
toastify.custom('Custom message', {
  position: 'top-center',
  autoClose: 2000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: 'dark'
});
```

### Using the Hook

```typescript
import { useToastify } from '../utils/useToastify';

const MyComponent = () => {
  const { showToast } = useToastify();
  
  const handleClick = () => {
    showToast('success', 'Operation completed!');
  };
  
  return <button onClick={handleClick}>Click me</button>;
};
```

### Dismissing Toasts

```typescript
// Dismiss all toasts
toastify.dismiss();

// Dismiss specific toast (returns toast ID)
const toastId = toastify.success('This can be dismissed');
toastify.dismissToast(toastId);
```

## ⚙️ Configuration Options

### ToastContainer Props (in main.tsx)

```typescript
<ToastContainer
  position="top-right"        // Position on screen
  autoClose={3000}           // Auto-close duration
  hideProgressBar={false}    // Show/hide progress bar
  newestOnTop={false}        // New toasts on top/bottom
  closeOnClick={true}        // Close on click
  rtl={false}               // Right-to-left layout
  pauseOnFocusLoss={true}   // Pause when window loses focus
  draggable={true}          // Allow dragging
  pauseOnHover={true}       // Pause on hover
  theme="light"             // light/dark theme
/>
```

### Individual Toast Options

```typescript
interface ToastOptions {
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right' | 'bottom-center' | 'bottom-left';
  autoClose?: number | false;
  hideProgressBar?: boolean;
  closeOnClick?: boolean;
  pauseOnHover?: boolean;
  draggable?: boolean;
  theme?: 'light' | 'dark' | 'colored';
  style?: React.CSSProperties;
  className?: string;
  bodyClassName?: string;
  progressClassName?: string;
  // ... and many more
}
```

## 🎨 Styling

### CSS Customization

You can customize the appearance by overriding CSS classes:

```css
/* Custom toast styles */
.Toastify__toast {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.Toastify__toast--success {
  background: linear-gradient(135deg, #4CAF50, #45a049);
}

.Toastify__toast--error {
  background: linear-gradient(135deg, #f44336, #d32f2f);
}
```

### Inline Styles

```typescript
toastify.success('Styled message', {
  style: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 'bold'
  }
});
```

## 🔧 Migration from Ant Design Messages

Replace:

```typescript
// Old Ant Design way
import { message } from 'antd';
message.success('Success message');
```

With:

```typescript
// New React Toastify way
import { toastify } from '../utils/useToastify';
toastify.success('Success message');
```

## 📱 Responsive Design

React Toastify automatically handles responsive design, but you can customize:

```typescript
<ToastContainer
  position="top-right"
  autoClose={3000}
  // Mobile-friendly settings
  closeOnClick={true}
  draggable={true}
  pauseOnHover={false} // Better for mobile
/>
```

## 🧪 Testing

The Dashboard includes test buttons:
- **Test Toasts**: Shows all toast types
- **Promise Toast**: Demonstrates promise-based toasts

## 🎯 Best Practices

1. **Keep messages concise** - Users should understand quickly
2. **Use appropriate types** - success for confirmations, error for failures
3. **Don't overuse** - Too many toasts can be annoying
4. **Use promises for async operations** - Better UX for loading states
5. **Consider mobile users** - Shorter auto-close times on mobile
6. **Accessibility** - React Toastify handles this automatically

## 🔗 Resources

- [React Toastify Documentation](https://fkhadra.github.io/react-toastify/)
- [GitHub Repository](https://github.com/fkhadra/react-toastify)
- [Examples and Demos](https://fkhadra.github.io/react-toastify/examples)
