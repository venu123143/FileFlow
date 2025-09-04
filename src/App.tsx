import "./css/App.css";
import { Suspense } from "react";
import { ProtectedRoute } from "@/components/layouts/index";
import { USER_ROLES } from "@/types/user.types";
import { Routes, Route } from "react-router-dom";
import NotFound from "@/routes/Notfound";
import Home from "@/routes/Home";
import DeletedFiles from "@/routes/DeletedFiles";
import AllFiles from "@/routes/AllFiles";
import PrivateFiles from "@/routes/PrivateFiles";
import Settings from "@/routes/Settings";
import SharedFiles from "@/routes/SharedFiles";
import Notifications from "@/routes/Notifications";
import Login from "@/routes/auth/Login";
import Register from "@/routes/auth/Register";
import Unauthorized from "@/routes/Unauthorized";

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
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute roles={[USER_ROLES.USER]} />}>
            <Route path='/' element={<Home />} />
            <Route path='/all-files' element={<AllFiles />} />
            <Route path='/deleted-files' element={<DeletedFiles />} />
            <Route path='/private-files' element={<PrivateFiles />} />
            <Route path='/settings' element={<Settings />} />
            <Route path='/shared-files' element={<SharedFiles />} />
            <Route path='/notifications' element={<Notifications />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="/unauthorized" element={<Unauthorized />} />

        </Routes>
      </Suspense>
    </>
  )
}

export default App
