import "./css/App.css";
import { Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import NotFound from "@/routes/Notfound";
import Home from "@/routes/Home";
import DeletedFiles from "./routes/DeletedFiles";
import AllFiles from "./routes/AllFiles";
import PrivateFiles from "./routes/PrivateFiles";
import Settings from "./routes/Settings";
import SharedFiles from "./routes/SharedFiles";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";

// Loading component for Suspense fallback
const Loading = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

function App() {
  return (
    <DashboardLayout>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/all-files' element={<AllFiles />} />
          <Route path='/deleted-files' element={<DeletedFiles />} />
          <Route path='/private-files' element={<PrivateFiles />} />
          <Route path='/settings' element={<Settings />} />
          <Route path='/shared-files' element={<SharedFiles />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </DashboardLayout>
  )
}

export default App
