# 🚀 FileFlow

<div align="center">

**A Modern, Feature-Rich File Management System**

[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1.2-646CFF.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.12-38B2AC.svg)](https://tailwindcss.com/)

*Upload, organize, share, and manage your files with ease*

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Core Features](#-core-features)
- [Architecture](#-architecture)
- [Available Scripts](#-available-scripts)
- [Contributing](#-contributing)

---

## 🌟 Overview

**FileFlow** is a modern, cloud-based file management system built with React and TypeScript. It provides a seamless experience for uploading, organizing, sharing, and managing files with features like real-time notifications, drag-and-drop uploads, video/image preview, and advanced access control.

### ✨ Why FileFlow?

- **🎨 Beautiful UI**: Modern, responsive design with smooth animations
- **⚡ Lightning Fast**: Built on Vite for instant hot module replacement
- **🔒 Secure**: Multi-level access control (Public, Protected, Private)
- **📱 Mobile-First**: Fully responsive across all devices
- **🎯 Type-Safe**: 100% TypeScript for better developer experience
- **🔔 Real-Time**: Socket.io integration for live notifications
- **🎬 Media Preview**: Built-in video and image viewers

---

## 🎯 Features

### File Management
- ✅ **Upload Files**: Drag-and-drop or click to upload single/multiple files
- ✅ **Folder Organization**: Create, rename, move folders and files
- ✅ **Smart Search**: Quick file search across all directories
- ✅ **Bulk Operations**: Select and manage multiple files at once
- ✅ **File Sorting**: Sort by size, name, or date
- ✅ **Grid/List Views**: Toggle between grid and list layouts
- ✅ **Breadcrumb Navigation**: Easy navigation through folder hierarchy

### Access Control
- 🔐 **Three Access Levels**:
  - **Public**: Accessible to everyone
  - **Protected**: Accessible to authenticated users
  - **Private**: PIN-protected, encrypted storage
- 🔑 **PIN Protection**: Secure your private files with a PIN
- 👥 **File Sharing**: Share files with specific users with permission levels (View, Edit, Admin)

### Media Handling
- 🎬 **Video Player**: Built-in video player with controls (Video.js)
- 🖼️ **Image Viewer**: Advanced image viewer with zoom, rotate, and pan
- 📥 **Smart Downloads**: Downloads with timestamped filenames
- 🎯 **Thumbnail Generation**: Automatic thumbnail creation for media files

### User Experience
- 🔔 **Real-Time Notifications**: Instant updates for file operations
- 📊 **Upload Progress**: Real-time upload progress with pause/resume
- 🗑️ **Trash Management**: Soft delete with restore functionality
- ⚡ **Infinite Scroll**: Cursor-based pagination for better performance
- 🌓 **Dark Mode**: System-aware theme switching
- 📱 **Responsive Design**: Optimized for mobile, tablet, and desktop

### Additional Features
- 🔄 **Recent Files**: Quick access to recently opened files
- 📤 **Shared Files**: View files shared by you or with you
- ⚙️ **User Settings**: Manage profile, PIN, API tokens
- 🔌 **WebSocket Integration**: Real-time file updates
- 🎨 **Smooth Animations**: Framer Motion for delightful interactions

---

## 🛠️ Tech Stack

### Core
- **[React 19.1.1](https://reactjs.org/)** - UI Framework
- **[TypeScript 5.8.3](https://www.typescriptlang.org/)** - Type Safety
- **[Vite 7.1.2](https://vitejs.dev/)** - Build Tool & Dev Server

### Styling & UI
- **[TailwindCSS 4.1.12](https://tailwindcss.com/)** - Utility-First CSS
- **[Radix UI](https://www.radix-ui.com/)** - Headless UI Components
- **[Framer Motion 12.23.12](https://www.framer.com/motion/)** - Animations
- **[Lucide React](https://lucide.dev/)** - Icon Library

### State Management & Data Fetching
- **[TanStack React Query 5.85.9](https://tanstack.com/query)** - Server State Management
- **[Zustand 5.0.7](https://zustand-demo.pmnd.rs/)** - Client State Management
- **[React Hook Form 7.62.0](https://react-hook-form.com/)** - Form Management

### Routing & Navigation
- **[React Router DOM 7.8.0](https://reactrouter.com/)** - Client-Side Routing

### API & Real-Time
- **[Axios 1.11.0](https://axios-http.com/)** - HTTP Client
- **[Socket.io Client 4.8.1](https://socket.io/)** - Real-Time Communication

### Media & Files
- **[Video.js 8.23.4](https://videojs.com/)** - Video Player
- **Custom Image Viewer** - Advanced image manipulation

### Validation & Forms
- **[Zod 4.0.17](https://zod.dev/)** - Schema Validation
- **[@hookform/resolvers](https://www.npmjs.com/package/@hookform/resolvers)** - Form Validation Integration

### Notifications
- **[Sonner 2.0.7](https://sonner.emilkowal.ski/)** - Toast Notifications

---

## 📁 Project Structure

```
FileFlow/
├── src/
│   ├── api/                    # API client & endpoints
│   │   ├── axios.ts            # Axios configuration
│   │   ├── file.api.ts         # File operations API
│   │   ├── notification.api.ts # Notification API
│   │   └── auth.api.ts         # Authentication API
│   │
│   ├── components/             # React components
│   │   ├── custom/             # Custom UI components
│   │   │   ├── ImageViewer.tsx # Image preview with zoom/rotate
│   │   │   └── ...
│   │   ├── file-manager/       # File management components
│   │   │   ├── FileGrid.tsx    # Grid view
│   │   │   ├── FileList.tsx    # List view
│   │   │   ├── FileManager.tsx # Main file manager
│   │   │   ├── Toolbar.tsx     # Search & filters
│   │   │   └── ...
│   │   ├── upload/             # Upload-related components
│   │   │   ├── UploadPopup.tsx # Upload modal
│   │   │   ├── FileUploader.tsx# Drag-drop uploader
│   │   │   └── ...
│   │   ├── player/             # Media player components
│   │   ├── settings/           # Settings components
│   │   ├── session/            # Session & PIN components
│   │   ├── sidebar/            # Sidebar navigation
│   │   ├── user/               # User-related components
│   │   ├── layouts/            # Layout components
│   │   ├── error/              # Error components
│   │   └── ui/                 # Shadcn UI components
│   │
│   ├── contexts/               # React Context providers
│   │   ├── useAuth.tsx         # Authentication context
│   │   ├── fileContext.tsx     # File management state
│   │   ├── UploadContext.tsx   # Upload state & queue
│   │   ├── NotificationContext.tsx # Notification state
│   │   ├── SocketContext.tsx   # WebSocket connection
│   │   ├── ThemeContext.tsx    # Theme management
│   │   └── ...
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useFileDownload.tsx # File download logic
│   │   ├── useFileUpload.tsx   # Upload logic
│   │   ├── useTheme.tsx        # Theme hook
│   │   └── ...
│   │
│   ├── pages/                  # Page components
│   │   ├── all-files-page.tsx  # All files view
│   │   ├── private-files-page.tsx # Private files
│   │   ├── deleted-files-page.tsx # Trash
│   │   ├── shared-files-page.tsx  # Shared files
│   │   ├── notifications-page.tsx # Notifications
│   │   └── ...
│   │
│   ├── routes/                 # Route components
│   │   ├── auth/               # Authentication routes
│   │   ├── Home.tsx            # Dashboard
│   │   ├── AllFiles.tsx        # Files route wrapper
│   │   └── ...
│   │
│   ├── lib/                    # Utility libraries
│   │   ├── utils.ts            # Helper functions
│   │   ├── video-utils.ts      # Video utilities
│   │   ├── image-utils.ts      # Image utilities
│   │   └── ...
│   │
│   ├── types/                  # TypeScript types
│   │   ├── file.types.ts       # File-related types
│   │   ├── file-manager.ts     # File manager types
│   │   ├── user.types.ts       # User types
│   │   └── ...
│   │
│   ├── config/                 # Configuration files
│   │   └── page-configs.ts     # Page configurations
│   │
│   ├── store/                  # Zustand stores
│   │   └── auth.store.ts       # Auth state
│   │
│   ├── css/                    # Stylesheets
│   │   └── App.css             # Global styles
│   │
│   ├── App.tsx                 # Root component
│   └── main.tsx                # Entry point
│
├── public/                     # Static assets
├── components.json             # Shadcn UI config
├── tailwind.config.js          # Tailwind configuration
├── tsconfig.json               # TypeScript config
├── vite.config.ts              # Vite configuration
├── package.json                # Dependencies
└── README.md                   # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Bun.js** >= 1.0.0
- **Backend API** running (FileFlow Backend)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/venu123143/fileflow.git
   cd fileflow/FileFlow
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration (see [Environment Variables](#-environment-variables))

4. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   ```
   http://localhost:5173
   ```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_API_CDN_URL=https://cdn.yourdomain.com

# WebSocket Configuration
VITE_SOCKET_URL=http://localhost:3000

# Optional: Feature Flags
VITE_ENABLE_VIDEO_PLAYER=true
VITE_ENABLE_IMAGE_VIEWER=true
```

### Variable Descriptions

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | - |
| `VITE_API_CDN_URL` | CDN URL for file storage | - |
| `VITE_SOCKET_URL` | WebSocket server URL | - |

---

## 💡 Core Features

### 1. File Upload System

```typescript
// Multi-file upload with drag & drop
- Chunked upload for large files
- Real-time progress tracking
- Pause/resume functionality
- Automatic retry on failure
- Thumbnail generation
```

### 2. Access Level Management

```typescript
export const ACCESS_LEVEL = {
  PUBLIC: 'public',      // Anyone can access
  PROTECTED: 'protected', // Authenticated users
  PRIVATE: 'private'      // PIN-protected
}
```

### 3. File Download

```typescript
// Download with timestamped filenames
// Example: document.pdf → document_17234.pdf
- CORS-aware fallback mechanism
- Folder download prevention
- Batch download support
```

### 4. Real-Time Notifications

```typescript
// Socket.io events
- 'notification:new' → New notification
- 'last_accessed' → File access tracking
- Cursor-based pagination for performance
```

---

## 🏗️ Architecture

### State Management

**Context API + React Query + Zustand**

```
┌─────────────────────────────────────────┐
│           Application State             │
├─────────────────────────────────────────┤
│  AuthContext (Zustand)                  │
│  ├─ User authentication                 │
│  └─ Session management                  │
│                                          │
│  FileContext (React Query)              │
│  ├─ File CRUD operations                │
│  ├─ Folder navigation                   │
│  └─ Cache management                    │
│                                          │
│  UploadContext (React Context)          │
│  ├─ Upload queue                        │
│  ├─ Progress tracking                   │
│  └─ Chunk management                    │
│                                          │
│  NotificationContext (React Query)      │
│  ├─ Notification list                   │
│  ├─ Unread count                        │
│  └─ Mark as read                        │
│                                          │
│  SocketContext (WebSocket)              │
│  └─ Real-time events                    │
└─────────────────────────────────────────┘
```

### Data Flow

```
User Action → Component → Context/Hook → API Client → Backend
                ↓                                        ↓
            UI Update ← React Query Cache ← Response ←──┘
                ↓
        WebSocket Event → Update State → Re-render
```

### Routing Strategy

```typescript
// Protected Routes
<ProtectedRoute roles={[USER_ROLES.USER]}>
  ├─ /                      # Dashboard
  ├─ /all-files             # All files
  ├─ /private-files         # Private files (PIN required)
  ├─ /deleted-files         # Trash
  ├─ /shared-files          # Shared files
  ├─ /notifications         # Notifications
  └─ /settings              # User settings
</ProtectedRoute>

// Public Routes
├─ /login                   # Login page
├─ /register                # Registration
└─ /unauthorized            # Access denied
```

---

## 📜 Available Scripts

### Development

```bash
npm run dev          # Start development server (http://localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Build

```bash
npm run build        # TypeScript check + Vite build
# Output: dist/
```

---

## 🎨 Component Examples

### File Manager Integration

```tsx
import { FileManager } from '@/components/file-manager/FileManager';

<FileManager
  files={filteredFiles}
  selectedFiles={selectedFiles}
  pageConfig={standardPageConfig}
  viewConfig={defaultViewConfig}
  actionHandlers={{
    onDownload: downloadFile,
    onShare: shareFile,
    onDelete: deleteFile,
    // ... other handlers
  }}
  viewMode={viewMode}
/>
```

### Upload Integration

```tsx
import { useUpload } from '@/contexts/UploadContext';

const { addToQueue, uploadFiles } = useUpload();

// Add files to queue
addToQueue(files, {
  folder_id: currentFolderId,
  access_level: ACCESS_LEVEL.PROTECTED
});
```

### Custom Hooks Usage

```tsx
import { useFileDownload } from '@/hooks/useFileDownload';

const { downloadFile, downloadMultipleFiles } = useFileDownload();

// Download single file
await downloadFile(fileItem);

// Download multiple files
await downloadMultipleFiles([file1, file2, file3]);
```

---

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ PIN protection for private files
- ✅ Role-based access control (RBAC)
- ✅ Secure file storage with access levels
- ✅ API token management
- ✅ Session timeout handling
- ✅ CORS protection
- ✅ XSS prevention

---

## 🌐 Browser Support

| Browser | Version |
|---------|---------|
| Chrome  | Latest  |
| Firefox | Latest  |
| Safari  | Latest  |
| Edge    | Latest  |

---

## 📱 Responsive Breakpoints

```typescript
sm:  640px  // Mobile landscape / Tablet
md:  768px  // Tablet
lg:  1024px // Desktop
xl:  1280px // Large desktop
2xl: 1536px // Extra large desktop
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 Code Style

This project uses:
- **ESLint** for linting
- **TypeScript** for type checking
- **Prettier** (recommended) for code formatting

---

## 🐛 Known Issues & Limitations

- CORS issues with some CDN configurations (fallback mechanism in place)
- Large file uploads (>1GB) may require chunking optimization
- Mobile pinch-to-zoom on image viewer needs refinement

---

## 🗺️ Roadmap

- [ ] Offline mode support
- [ ] File versioning
- [ ] Advanced search filters
- [ ] Collaborative editing
- [ ] File encryption at rest
- [ ] Integration with cloud storage (Google Drive, Dropbox)
- [ ] Mobile app (React Native)
- [ ] AI-powered file tagging

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- [Radix UI](https://www.radix-ui.com/) for accessible components
- [Shadcn UI](https://ui.shadcn.com/) for component inspiration
- [TanStack](https://tanstack.com/) for amazing developer tools
- The React community for continuous innovation

---

<div align="center">

**Built with ❤️ using React + TypeScript + Vite**

[⬆ Back to Top](#-fileflow)

</div>
