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
import AdminContentItemEditor from "./pages/AdminContentItemEditor";
import AdminSettings from "./pages/AdminSettings";
import AdminMahasiswa from "./pages/AdminMahasiswa";
import AdminPengurus from "./pages/AdminPengurus";
import ArchivePage from "./pages/admin/ArchivePage";
import ActivityPage from "./pages/admin/ActivityPage";
import ActivityDetailPage from "./pages/admin/ActivityDetailPage";
import FinancePage from "./pages/admin/FinancePage";
import Profile from "./pages/Profile";
import BeritaList from "./pages/BeritaList";
import BeritaDetail from "./pages/BeritaDetail";
import AcaraList from "./pages/AcaraList";
import AcaraDetail from "./pages/AcaraDetail";
import Forum from "./pages/Forum";
import ForumTopicDetail from "./pages/ForumTopicDetail";
import DashboardAcara from "./pages/DashboardAcara";
import Pengurus from "./pages/Pengurus";
import DepartmentPortal from "./pages/DepartmentPortal";
import ProgramKerja from "./pages/ProgramKerja";
import DepartemenList from "./pages/DepartemenList";
import FaqList from "./pages/FaqList";

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
      <Route path="/berita" element={<BeritaList />} />
      <Route path="/berita/:slug" element={<BeritaDetail />} />
      <Route path="/acara" element={<AcaraList />} />
      <Route path="/acara/:id" element={<AcaraDetail />} />
      <Route path="/pengurus" element={<Pengurus />} />
      <Route path="/pengurus/department/:id" element={<DepartmentPortal />} />
      <Route path="/program-kerja" element={<ProgramKerja />} />
      <Route path="/departemen" element={<DepartemenList />} />
      <Route path="/faq" element={<FaqList />} />

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
        <Route path="acara" element={<DashboardAcara />} />
        <Route path="kehadiran" element={<Placeholder />} />
        <Route path="kas" element={<Placeholder />} />
        <Route path="forum" element={<Forum />} />
        <Route path="forum/:topicId" element={<ForumTopicDetail />} />
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
        <Route path="content" element={<AdminContent />} />
        <Route path="content/editor" element={<AdminContentEditor />} />
        <Route path="content/editor/:id" element={<AdminContentEditor />} />
        <Route path="content/:contentType" element={<AdminContentItemEditor />} />
        <Route path="content/:contentType/:id" element={<AdminContentItemEditor />} />
        <Route path="users" element={<AdminMahasiswa />} />
        <Route path="pengurus" element={<AdminPengurus />} />
        <Route path="persuratan" element={<ArchivePage />} />
        <Route path="activities" element={<ActivityPage />} />
        <Route path="activities/:id" element={<ActivityDetailPage />} />
        <Route path="keuangan" element={<FinancePage />} />
        <Route path="menus" element={<AdminPlaceholder />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
