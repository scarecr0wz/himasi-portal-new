import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

const API = "/api";

/** Normalize avatar URL: always same-origin /api/uploads/:filename so image loads. */
export function avatarUrl(avatar: string | null | undefined): string | null {
  if (!avatar || typeof avatar !== "string") return null;
  const s = avatar.trim();
  if (!s) return null;
  const filename = s.includes("/") ? s.replace(/^.*\//, "") : s;
  if (!filename) return null;
  return `${API}/uploads/${filename}`;
}

type User = {
  id: string;
  name: string;
  nim: string;
  email: string;
  avatar: string | null;
  jabatan: string | null;
  departemen: { id: string; title: string } | null;
  angkatan: string | null;
  roles?: string[];
  permissions?: string[];
};

export type LoginResult = { user: User; roles: string[] };

type AuthContextType = {
  token: string | null;
  user: User | null;
  roles: string[];
  login: (nim: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  loadMe: () => Promise<void>;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = "himasi_portal_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY));
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<string[]>([]);

  const loadMe = useCallback(async () => {
    const t = token ?? localStorage.getItem(STORAGE_KEY);
    if (!t) return;
    const res = await fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${t}` } });
    if (!res.ok) {
      setToken(null);
      setUser(null);
      setRoles([]);
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    const data = await res.json();
    setUser(data.user);
    setRoles(Array.isArray(data.roles) ? data.roles : []);
    setToken(t);
  }, [token]);

  const login = useCallback(async (nim: string, password: string): Promise<LoginResult> => {
    const res = await fetch(`${API}/auth/sign-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nim, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Login gagal");
    }
    const data = await res.json();
    const t = data.access_token;
    setToken(t);
    localStorage.setItem(STORAGE_KEY, t);
    setUser(data.user);
    const meRes = await fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${t}` } });
    const meData = meRes.ok ? await meRes.json() : { user: data.user, roles: [] };
    const roleList = Array.isArray(meData.roles) ? meData.roles : [];
    setRoles(roleList);
    return { user: meData.user ?? data.user, roles: roleList };
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setRoles([]);
    localStorage.removeItem(STORAGE_KEY);
    // Defer redirect so state is committed first; replace so back button doesn't return to dashboard
    setTimeout(() => navigate("/", { replace: true }), 0);
  }, [navigate]);

  useEffect(() => {
    const t = token ?? localStorage.getItem(STORAGE_KEY);
    if (t) void loadMe();
  }, [token, loadMe]);

  const isAdmin = roles.includes("admin") || roles.includes("superadmin");

  return (
    <AuthContext.Provider value={{ token, user, roles, login, logout, loadMe, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
