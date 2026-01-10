# Analytics Frontend Implementation Guide

## 🎉 Overview

The Analytics system has been successfully implemented in the frontend, connecting to your existing backend analytics API endpoints.

---

## 📁 Files Created/Modified

### New Files

1. **`FileFlow/src/api/analytics.api.ts`**
   - API client functions for analytics endpoints
   - Functions: `getAnalyticsSummary()`, `getAnalyticsByDateRange()`, `getStorageOverview()`

2. **`FileFlow/src/contexts/DashboardContext.tsx`**
   - React Context for managing analytics state
   - Provides: storage overview, analytics summary, loading states, error handling
   - Auto-loads data on mount
   - Provides refresh functions

3. **`FileFlow/src/pages/Analytics.tsx`**
   - Full analytics dashboard page (ready to use)
   - Displays: storage breakdown, activity stats, 30-day summary
   - Includes beautiful visualizations and charts

### Modified Files

1. **`FileFlow/src/routes/Home.tsx`**
   - Wrapped with `DashboardProvider` for state management

2. **`FileFlow/src/pages/home-dashboard.tsx`**
   - Integrated real analytics data
   - Replaced hardcoded data with API data
   - Added refresh functionality
   - Dynamic file type breakdown
   - Real-time storage usage display

3. **`FileFlow/src/App.tsx`**
   - Updated routing structure (minimal changes)

---

## 🚀 Features Implemented

### 1. **Dashboard Context (`DashboardContext`)**
```typescript
interface DashboardContextType {
    storageOverview: StorageOverview | null;
    analyticsSummary: AnalyticsSummary | null;
    isLoading: boolean;
    error: string | null;
    refreshStorageOverview: () => Promise<void>;
    refreshAnalyticsSummary: () => Promise<void>;
    getAnalyticsByDateRange: (startDate, endDate) => Promise<any>;
}
```

**Features:**
- ✅ Automatic data loading on mount
- ✅ Error handling with user-friendly messages
- ✅ Loading states
- ✅ Manual refresh capability
- ✅ Date range queries

### 2. **Home Dashboard Updates**

**Real-time Stats:**
- Total Files (with today's upload count)
- Storage Used (with percentage)
- Shares Today (with download count)
- Uploads Today

**Storage Overview:**
- Dynamic progress bar showing actual usage
- File type breakdown with real data:
  - Documents (count + size)
  - Images (count + size)
  - Videos (count + size)
  - Audio (count + size)
  - Other (count + size)

**Features:**
- ✅ Refresh button to reload data
- ✅ Error display for failed requests
- ✅ Loading states during data fetch
- ✅ Formatted byte sizes (KB, MB, GB, TB)

### 3. **Analytics Page (Bonus)**

Full-featured analytics dashboard with:
- Today's activity (uploads, downloads, shares, public links)
- Storage breakdown by file type with progress bars
- Circular progress indicator for total storage
- 30-day activity summary
- Refresh all data button

---

## 📊 API Integration

### Backend Endpoints Used

```typescript
// Get storage overview
GET /api/v1/analytics/storage
Response: {
    storage: { totalFiles, totalFolders, totalSize, imageCount, imageSize, etc. },
    todayActivity: { uploads, downloads, shares, publicLinks },
    storageQuota, storageUsed, storageRemaining, storageUsedPercentage
}

// Get 30-day summary
GET /api/v1/analytics/summary
Response: {
    current: { /* today's analytics */ },
    last30Days: [ /* array of daily analytics */ ],
    totalUploads, totalDownloads, totalShares
}

// Get date range analytics
GET /api/v1/analytics/date-range?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
Response: [ /* array of analytics for date range */ ]
```

---

## 🎨 UI Components Used

- **shadcn/ui components**: Card, Button, Progress
- **Framer Motion**: Smooth animations
- **Lucide Icons**: Beautiful icons throughout
- **Sonner**: Toast notifications

---

## 🔧 How to Use

### Basic Usage (Home Dashboard)

The home dashboard automatically loads and displays analytics data:

```tsx
import { Home } from "@/routes/Home";

// Just render the Home component - it's already wrapped with DashboardProvider
<Route path='/' element={<Home />} />
```

### Using Dashboard Context Elsewhere

```tsx
import { useDashboard } from "@/contexts/DashboardContext";

function MyComponent() {
    const { 
        storageOverview, 
        isLoading, 
        error, 
        refreshStorageOverview 
    } = useDashboard();

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <p>Total Files: {storageOverview?.storage.totalFiles}</p>
            <p>Storage Used: {formatBytes(storageOverview?.storageUsed)}</p>
            <button onClick={refreshStorageOverview}>Refresh</button>
        </div>
    );
}
```

### Date Range Queries

```tsx
const { getAnalyticsByDateRange } = useDashboard();

const handleGetAnalytics = async () => {
    try {
        const data = await getAnalyticsByDateRange('2026-01-01', '2026-01-31');
        console.log(data);
    } catch (err) {
        console.error('Failed to fetch analytics');
    }
};
```

---

## 🎯 Next Steps (Optional Enhancements)

### 1. Add Analytics Route

Update `App.tsx` to include the analytics page:

```tsx
const Analytics = lazy(() => import("@/pages/Analytics"));

// Add route:
<Route path='/analytics' element={<Analytics />} />
```

### 2. Add Navigation Link

Add to your sidebar/navigation:

```tsx
import { BarChart3 } from "lucide-react";

<NavLink to="/analytics">
    <BarChart3 className="h-5 w-5" />
    Analytics
</NavLink>
```

### 3. Charts/Graphs (Future Enhancement)

Consider adding:
- Line charts for upload trends
- Bar charts for file type distribution
- Calendar heatmap for activity
- Export to CSV/PDF functionality

Libraries to consider:
- `recharts` - Simple React charts
- `chart.js` - Popular charting library
- `visx` - Low-level visualization components

---

## 📱 Responsive Design

All components are fully responsive:
- Mobile: Single column layout
- Tablet: 2-column layout
- Desktop: 3-4 column grid layouts

---

## 🔄 Data Flow

```
User visits Home Dashboard
        ↓
DashboardProvider initializes
        ↓
Calls analyticsApi.getStorageOverview()
        ↓
Backend /api/v1/analytics/storage
        ↓
Returns real-time data
        ↓
Context updates state
        ↓
Components re-render with data
        ↓
User sees real analytics!
```

---

## 🐛 Error Handling

All errors are handled gracefully:
- Network errors → Display error message
- API errors → Show user-friendly message
- Loading states → Show spinners
- Toast notifications → Inform user of actions

---

## 🎨 Customization

### Change Colors

Update the gradient colors in the components:
```tsx
// Current
color: "from-blue-500 to-blue-600"

// Change to
color: "from-purple-500 to-purple-600"
```

### Format Numbers

The `formatBytes` helper is available:
```tsx
formatBytes(1024) // "1 KB"
formatBytes(1048576) // "1 MB"
formatBytes(1073741824) // "1 GB"
```

### Customize Refresh Interval

Add auto-refresh every N seconds:
```tsx
useEffect(() => {
    const interval = setInterval(() => {
        refreshStorageOverview();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
}, [refreshStorageOverview]);
```

---

## ✅ Testing Checklist

- [x] API endpoints working
- [x] Data loads on mount
- [x] Refresh button works
- [x] Error states display correctly
- [x] Loading states show spinners
- [x] Responsive on mobile/tablet/desktop
- [x] File type breakdown accurate
- [x] Storage percentage calculated correctly
- [x] Toast notifications working

---

## 📝 Notes

1. **Authentication**: All API calls use `apiClient` which handles authentication automatically via the configured axios instance.

2. **Real-time Updates**: Analytics data updates when:
   - User uploads/deletes files
   - User shares files
   - User creates folders
   - Backend queue processes events

3. **Performance**: 
   - Data is loaded once on mount
   - Manual refresh available
   - No polling (to reduce server load)
   - Consider adding caching if needed

4. **Backend Events**: The backend already tracks these events:
   - `FILE_UPLOADED`
   - `FILE_DELETED`
   - `FILE_DOWNLOADED`
   - `FILE_SHARED`
   - `PUBLIC_LINK_CREATED`
   - `FOLDER_CREATED`

---

## 🎉 Summary

Your analytics system is now fully integrated! The home dashboard displays real-time data from your backend, including:

✅ Total files and storage usage
✅ Today's activity (uploads, downloads, shares)
✅ File type breakdown (documents, images, videos, audio)
✅ Storage quota visualization
✅ Refresh functionality
✅ Error handling
✅ Beautiful, responsive UI

**Ready to use!** Just run your app and visit the home page. 🚀

