import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./lib/auth";
import Layout from "./components/Layout";
import AdminLayout from "./components/AdminLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Placeholder from "./pages/Placeholder";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPlaceholder from "./pages/AdminPlaceholder";
import AdminContent from "./pages/AdminContent";
import AdminContentEditor from "./pages/AdminContentEditor";
import AdminSettings from "./pages/AdminSettings";
import AdminMahasiswa from "./pages/AdminMahasiswa";
import Profile from "./pages/Profile";
import Berita from "./pages/Berita";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { token, user, isAdmin } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (token && user === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-light">
        <p className="text-slate-500">Memuat...</p>
      </div>
    );
  }
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/berita/:slug" element={<Berita />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="profile" element={<Profile />} />
        <Route path="akademik" element={<Placeholder />} />
        <Route path="acara" element={<Placeholder />} />
        <Route path="kehadiran" element={<Placeholder />} />
        <Route path="kas" element={<Placeholder />} />
        <Route path="forum" element={<Placeholder />} />
        <Route path="activities" element={<Placeholder />} />
      </Route>

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<Navigate to="/admin/settings" replace />} />
        <Route path="mahasiswa" element={<AdminMahasiswa />} />
        <Route path="roles" element={<Navigate to="/admin/settings" replace />} />
        <Route path="content" element={<AdminContent />} />
        <Route path="content/editor" element={<AdminContentEditor />} />
        <Route path="content/editor/:id" element={<AdminContentEditor />} />
        <Route path="menus" element={<AdminPlaceholder />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
