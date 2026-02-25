import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";

export default function Login() {
  const [nim, setNim] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { roles } = await login(nim, password);
      const isAdmin = roles.includes("admin") || roles.includes("superadmin");
      navigate(isAdmin ? "/admin" : "/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login gagal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrap">
      <h2>Masuk ke Portal</h2>
      <form onSubmit={handleSubmit}>
        <div className="login-field">
          <label htmlFor="nim" className="login-label">NIM</label>
          <input
            id="nim"
            type="text"
            value={nim}
            onChange={(e) => setNim(e.target.value)}
            required
            className="login-input"
            autoComplete="username"
          />
        </div>
        <div className="login-field">
          <label htmlFor="password" className="login-label">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="login-input"
            autoComplete="current-password"
          />
        </div>
        {error && <p className="login-error">{error}</p>}
        <button type="submit" disabled={loading} className="login-btn">
          {loading ? "Memproses..." : "Masuk"}
        </button>
      </form>
    </div>
  );
}
