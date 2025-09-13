# Background File Upload System

This document explains the new background file upload system that allows uploads to continue even when users navigate away from the upload page.

## Overview

The system consists of several key components:

### 1. GlobalUploadContext (`src/contexts/GlobalUploadContext.tsx`)
- **Purpose**: Manages upload state globally across the entire application
- **Features**:
  - Persists upload state across navigation
  - Handles chunked file uploads with resumable capability
  - Tracks upload progress, status, and errors
  - Manages multiple concurrent uploads
  - Automatically creates file records in the database upon completion

### 2. Updated useFileUpload Hook (`src/hooks/useFileUpload.tsx`)
- **Purpose**: Provides a clean interface to the global upload system
- **Changes**:
  - Now uses GlobalUploadContext instead of local state
  - Accepts optional `folderId` parameter
  - Maintains the same API for backward compatibility

### 3. GlobalUploadIndicator (`src/components/upload/GlobalUploadIndicator.tsx`)
- **Purpose**: Shows upload progress and status across all pages
- **Features**:
  - Floating indicator in bottom-right corner
  - Expandable/collapsible interface
  - Shows active, completed, and failed uploads
  - Allows retry, cancel, and remove operations
  - Real-time progress updates

### 4. Enhanced Upload Page (`src/routes/Upload.tsx`)
- **Purpose**: Shows existing uploads when user returns to the page
- **Features**:
  - Displays current uploads for the specific folder
  - Shows upload status and progress
  - Seamless integration with new upload system

## How It Works

### Upload Flow
1. User selects files on the upload page
2. Files are added to the global upload state
3. User can start uploads or navigate away
4. Uploads continue in the background
5. Progress is tracked and displayed globally
6. Upon completion, files are automatically saved to the database

### Navigation Persistence
- Upload state is stored in React Context at the app level
- State persists across all route changes
- Users can navigate freely while uploads continue
- Global indicator shows upload status on any page

### Resumable Uploads
- Uses chunked upload system (5MB chunks)
- Automatically resumes from last uploaded chunk
- Handles network interruptions gracefully
- Maintains upload progress across page refreshes

## Usage

### For Developers

```typescript
// In any component
import { useGlobalUpload } from '@/contexts/GlobalUploadContext';

const MyComponent = () => {
  const { 
    uploads, 
    activeUploads, 
    addFile, 
    handleUpload,
    getActiveUploads 
  } = useGlobalUpload();
  
  // Access upload state and controls
};
```

### For Users

1. **Start Upload**: Go to upload page, select files, click upload
2. **Navigate Away**: Uploads continue in background
3. **Monitor Progress**: Use the floating indicator on any page
4. **Return to Upload Page**: See all uploads for that folder
5. **Manage Uploads**: Retry failed uploads, cancel active ones

## Benefits

- **User Experience**: No need to stay on upload page
- **Reliability**: Resumable uploads handle network issues
- **Visibility**: Always know upload status
- **Flexibility**: Upload to any folder from anywhere
- **Performance**: Chunked uploads for large files

## Technical Details

### State Management
- Uses React Context + useReducer for state management
- State persists across component unmounts
- Optimized re-renders with useCallback

### API Integration
- Uses existing chunked upload endpoints
- Integrates with file creation API
- Handles authentication automatically

### Error Handling
- Comprehensive error states
- Retry mechanisms
- User-friendly error messages
- Graceful degradation

## Future Enhancements

- Upload queue management
- Upload speed optimization
- Batch operations
- Upload scheduling
- Progress notifications
