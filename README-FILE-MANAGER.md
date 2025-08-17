# File Manager System Documentation

## Overview

The File Manager System is a unified, flexible component system that can be used across different pages with minimal configuration changes. It supports multiple file variants (standard, deleted, private, shared) and provides consistent UI patterns while allowing for page-specific customizations.

## Architecture

### Core Components

1. **FileManager** - Main orchestrator component
2. **FileGrid** - Grid view display
3. **FileList** - List view display
4. **FileGridItem** - Individual grid item
5. **FileListItem** - Individual list item
6. **EmptyState** - Empty state display

### Type System

The system uses strict TypeScript with discriminated unions for different file types:

- `StandardFileItem` - Basic file/folder items
- `DeletedFileItem` - Items in trash with deletion metadata
- `PrivateFileItem` - Encrypted/sensitive items
- `SharedFileItem` - Shared items with permission metadata

## Usage

### Basic Implementation

```tsx
import { FileManager } from "@/components/file-manager/FileManager"
import { standardPageConfig, defaultViewConfig } from "@/config/page-configs"
import type { FileActionHandlers } from "@/types/file-manager"

const actionHandlers: FileActionHandlers = {
  onFileSelect: (fileId) => console.log("Select", fileId),
  onItemClick: (item) => console.log("Click", item.name),
  onDownload: (file) => console.log("Download", file.name),
  onShare: (file) => console.log("Share", file.name),
  onStar: (file) => console.log("Star", file.name),
  onDelete: (file) => console.log("Delete", file.name),
}

<FileManager
  files={files}
  selectedFiles={selectedFiles}
  pageConfig={standardPageConfig}
  viewConfig={defaultViewConfig}
  actionHandlers={actionHandlers}
  viewMode="grid"
/>
```

### Page Configurations

#### Standard Page
```tsx
import { standardPageConfig } from "@/config/page-configs"

// Shows: thumbnails, file type, size, modified date, starred, shared
// Actions: download, share, star, delete
```

#### Deleted Files Page
```tsx
import { deletedPageConfig } from "@/config/page-configs"

// Shows: file type, size, deletion info, days left
// Actions: restore, delete
// Custom: Restore action
```

#### Private Files Page
```tsx
import { privatePageConfig } from "@/config/page-configs"

// Shows: thumbnails, file type, size, modified date, starred, encrypted status, sensitive status
// Actions: download, share, star, delete, encrypt, decrypt
// Custom: Encrypt/Decrypt actions
```

#### Shared Files Page
```tsx
import { sharedPageConfig } from "@/config/page-configs"

// Shows: thumbnails, file type, size, modified date, starred, shared status, sharing info
// Actions: download, share, star, delete, change permission
// Custom: Change Permission action
```

### View Configurations

#### Default View
```tsx
import { defaultViewConfig } from "@/config/page-configs"

// Grid: 2-6 columns responsive, standard gaps
// List: 16px height, shows thumbnails, file type, size, modified date
```

#### Compact View
```tsx
import { compactViewConfig } from "@/config/page-configs"

// Grid: 3-7 columns responsive, smaller gaps
// List: 12px height, no thumbnails, shows file type, size, modified date
```

### Custom Actions

You can add custom actions to any page configuration:

```tsx
const customPageConfig: PageConfig = {
  ...standardPageConfig,
  customActions: [
    {
      label: "Custom Action",
      icon: CustomIcon,
      action: (file) => console.log("Custom action for", file.name),
      variant: "default" // or "destructive", "secondary"
    }
  ]
}
```

### Action Handlers

Implement only the handlers you need:

```tsx
const actionHandlers: FileActionHandlers = {
  // Required
  onFileSelect: (fileId) => setSelectedFiles(prev => [...prev, fileId]),
  onItemClick: (item) => handleItemClick(item),
  
  // Optional - only implement what you need
  onDownload: (file) => downloadFile(file),
  onShare: (file) => shareFile(file),
  onStar: (file) => toggleStar(file),
  onDelete: (file) => deleteFile(file),
  onRestore: (file) => restoreFile(file),
  onEncrypt: (file) => encryptFile(file),
  onDecrypt: (file) => decryptFile(file),
  onPermissionChange: (file, permission) => updatePermission(file, permission),
  onCustomAction: (action, file) => handleCustomAction(action, file)
}
```

## Features

### Responsive Design
- Grid view adapts columns based on screen size
- List view maintains readability across devices
- Touch-friendly interactions

### Accessibility
- Proper ARIA labels
- Keyboard navigation support
- Screen reader friendly

### Performance
- Virtual scrolling support (can be added)
- Lazy loading of thumbnails
- Efficient re-renders with React.memo

### Customization
- Configurable display options
- Custom action support
- Theme-aware styling
- Flexible layout options

## Migration Guide

### From Old Components

**Before:**
```tsx
<FileGrid
  files={files}
  selectedFiles={selectedFiles}
  onFileSelect={onFileSelect}
  onItemClick={onItemClick}
/>
```

**After:**
```tsx
<FileManager
  files={files}
  selectedFiles={selectedFiles}
  pageConfig={standardPageConfig}
  viewConfig={defaultViewConfig}
  actionHandlers={{
    onFileSelect,
    onItemClick
  }}
  viewMode="grid"
/>
```

### Data Structure Updates

Add `variant` property to all file items:

```tsx
// Before
const file = {
  id: "1",
  name: "document.pdf",
  type: "file",
  // ... other properties
}

// After
const file = {
  id: "1",
  name: "document.pdf",
  type: "file",
  variant: "standard", // Add this
  // ... other properties
}
```

## Best Practices

1. **Use Type Guards**: Always use the provided type guards when checking file variants
2. **Implement Required Handlers**: Always implement `onFileSelect` and `onItemClick`
3. **Conditional Actions**: Only show actions that have implemented handlers
4. **Consistent Styling**: Use the provided CSS classes for consistent appearance
5. **Performance**: Avoid creating new objects in render functions

## Troubleshooting

### Common Issues

1. **TypeScript Errors**: Ensure all file items have the `variant` property
2. **Missing Actions**: Check that required action handlers are implemented
3. **Styling Issues**: Verify CSS classes are properly imported
4. **Performance**: Use React.memo for expensive components

### Debug Mode

Enable debug logging by setting environment variable:
```bash
REACT_APP_DEBUG_FILE_MANAGER=true
```

## Examples

See the following files for complete examples:
- `src/pages/all-files-page.tsx` - Standard implementation
- `src/config/page-configs.ts` - Configuration examples
- `src/types/file-manager.ts` - Type definitions
