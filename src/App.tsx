import "./css/App.css";
import { Suspense, lazy } from "react";
import { ProtectedRoute } from "@/components/layouts/index";
import { USER_ROLES } from "@/types/user.types";
import { Routes, Route } from "react-router-dom";
import Login from "@/routes/auth/Login";
import Register from "@/routes/auth/Register";
import UploadPopup from "@/components/upload/UploadPopup";
import RoleBasedRedirect from "@/routes/RoleBasedRedirect";

// Lazy load routes
const NotFound = lazy(() => import("@/routes/Notfound"));
const Home = lazy(() => import("@/routes/Home"));
const DeletedFiles = lazy(() => import("@/routes/DeletedFiles"));
const AllFiles = lazy(() => import("@/routes/AllFiles"));
const PrivateFiles = lazy(() => import("@/routes/PrivateFiles"));
const Settings = lazy(() => import("@/routes/Settings"));
const SharedFiles = lazy(() => import("@/routes/SharedFiles"));
const Notifications = lazy(() => import("@/routes/Notifications"));
const Unauthorized = lazy(() => import("@/routes/Unauthorized"));
const Upload = lazy(() => import("@/routes/Upload"));
const Videos = lazy(() => import("@/routes/Videos"));
const Images = lazy(() => import("@/routes/Images"));
const Documents = lazy(() => import("@/routes/Documents"));
const LikedVideos = lazy(() => import("@/routes/LikedVideos"));

// Loading component for Suspense fallback
const Loading = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

function App() {
  return (
    <>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<RoleBasedRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute roles={[USER_ROLES.USER]} />}>
            <Route path='/home' element={<Home />} />
            <Route path='/all-files' element={<AllFiles />} />
            <Route path='/deleted-files' element={<DeletedFiles />} />
            <Route path='/private-files' element={<PrivateFiles />} />
            <Route path='/settings' element={<Settings />} />
            <Route path='/shared-files' element={<SharedFiles />} />
            <Route path='/notifications' element={<Notifications />} />
            <Route path='/all-files/:folder_id' element={<Upload />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route element={<ProtectedRoute roles={[USER_ROLES.ADMIN]} />}>
            <Route path='/videos' element={<Videos />} />
            <Route path='/images' element={<Images />} />
            <Route path='/documents' element={<Documents />} />
            <Route path='/liked-videos' element={<LikedVideos />} />
          </Route>
          <Route path="/unauthorized" element={<Unauthorized />} />
        </Routes>

        <UploadPopup />
      </Suspense>
    </>
  )
}

export default App
