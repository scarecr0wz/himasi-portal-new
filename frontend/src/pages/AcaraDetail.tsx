import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/lib/auth";
import PublicNavbar from "../components/PublicNavbar";
import PublicFooter from "../components/PublicFooter";
import SEO from "../components/SEO";

const API = "/api";

type ActivityDetail = {
  id: string;
  title: string;
  image: string | null;
  desc: string | null;
  startAt: string;
  endAt: string;
  departemen?: { id: string; title: string } | null;
};

type Participant = {
  userId: string;
  name: string;
  nim: string;
  isAdmin: boolean;
  participatedAt: string;
};

function formatDate(d: string): string {
  try {
    return new Date(d).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export default function AcaraDetail() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [activity, setActivity] = useState<ActivityDetail | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [registered, setRegistered] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("ID acara tidak valid");
      return;
    }
    setLoading(true);
    setError(null);
    Promise.all([
      fetch(`${API}/content/activities/${id}`).then((r) => (r.ok ? r.json() : null)),
      fetch(`${API}/content/activities/${id}/participants`).then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([act, parts]) => {
        if (!act) {
          setError("Acara tidak ditemukan");
          setActivity(null);
        } else {
          setActivity(act);
          setParticipants(Array.isArray(parts) ? parts : []);
        }
      })
      .catch(() => {
        setError("Gagal memuat acara");
        setActivity(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id || !token) {
      setRegistered(null);
      return;
    }
    fetch(`${API}/profile/activities/${id}/registered`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : { registered: false }))
      .then((data) => setRegistered(!!data.registered))
      .catch(() => setRegistered(false));
  }, [id, token]);

  const fetchParticipants = () => {
    if (!id) return;
    fetch(`${API}/content/activities/${id}/participants`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setParticipants(Array.isArray(data) ? data : []))
      .catch(() => { });
  };

  const handleRegister = async () => {
    if (!id || !token) return;
    setRegisterError(null);
    setRegisterLoading(true);
    try {
      const res = await fetch(`${API}/profile/activities/${id}/register`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setRegisterError(data.message || "Gagal mendaftar");
        return;
      }
      setRegistered(true);
      fetchParticipants();
    } catch {
      setRegisterError("Gagal mendaftar");
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleUnregister = async () => {
    if (!id || !token) return;
    setRegisterError(null);
    setRegisterLoading(true);
    try {
      const res = await fetch(`${API}/profile/activities/${id}/register`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setRegisterError(data.message || "Gagal membatalkan");
        return;
      }
      setRegistered(false);
      fetchParticipants();
    } catch {
      setRegisterError("Gagal membatalkan pendaftaran");
    } finally {
      setRegisterLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="font-display bg-background-light min-h-screen flex flex-col">
        <PublicNavbar />
        <div className="flex-1 flex items-center justify-center py-20">
          <p className="text-slate-500">Memuat acara...</p>
        </div>
        <PublicFooter />
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="font-display bg-background-light min-h-screen flex flex-col">
        <PublicNavbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <p className="text-slate-600 mb-4">{error ?? "Acara tidak ditemukan"}</p>
          <Link to="/acara" className="text-primary font-semibold hover:underline">
            ← Kembali ke daftar acara
          </Link>
        </div>
        <PublicFooter />
      </div>
    );
  }

  const start = new Date(activity.startAt);
  const end = new Date(activity.endAt);
  const timeStr = `${start.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} - ${end.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`;
  const isUpcoming = new Date(activity.startAt) >= new Date();

  return (
    <div className="font-display bg-background-light text-slate-900 min-h-screen flex flex-col">
      <PublicNavbar />

      {activity && (
        <SEO
          title={activity.title}
          description={activity.desc?.replace(/[#*`~_]/g, '').substring(0, 160).trim() + "..."}
          image={activity.image || undefined}
        />
      )}

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 md:px-10 lg:px-16 py-12">
        <Link
          to="/acara"
          className="text-slate-500 hover:text-primary text-sm font-semibold inline-flex items-center gap-1 mb-6"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Semua Acara
        </Link>

        <article>
          <div className="mb-6">
            {activity.departemen && (
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                {activity.departemen.title}
              </span>
            )}
            <h1 className="text-slate-900 text-2xl md:text-3xl font-bold tracking-tight mb-4 leading-tight">
              {activity.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-slate-500 text-sm">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-lg">calendar_today</span>
                {formatDate(activity.startAt)}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-lg">schedule</span>
                {timeStr}
              </span>
            </div>
          </div>

          {activity.image && (
            <div className="rounded-2xl overflow-hidden shadow-lg mb-8">
              <img
                src={activity.image.startsWith("http") ? activity.image : activity.image.startsWith("/") ? activity.image : `/${activity.image}`}
                alt=""
                className="w-full aspect-video object-cover"
              />
            </div>
          )}

          {activity.desc && (
            <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed mb-10">
              <ReactMarkdown
                components={{
                  img: ({ src, alt }) => (
                    <span className="block my-4">
                      <img src={src} alt={alt ?? ""} className="max-w-full h-auto rounded-xl shadow-md mx-auto" />
                    </span>
                  ),
                }}
              >
                {activity.desc}
              </ReactMarkdown>
            </div>
          )}

          {/* Pendaftaran: hanya untuk acara mendatang, user login */}
          {isUpcoming && (
            <div className="mb-10 p-6 rounded-2xl border border-slate-200 bg-white">
              <h3 className="text-slate-900 font-bold mb-3">Pendaftaran</h3>
              {!token ? (
                <>
                  <p className="text-slate-600 text-sm mb-4">
                    Login untuk mendaftar acara ini.
                  </p>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors"
                  >
                    Login
                  </Link>
                </>
              ) : registered === true ? (
                <>
                  <p className="text-slate-600 text-sm mb-4">Anda terdaftar di acara ini.</p>
                  <button
                    type="button"
                    onClick={handleUnregister}
                    disabled={registerLoading}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 disabled:opacity-50"
                  >
                    {registerLoading ? "Memproses..." : "Batalkan pendaftaran"}
                  </button>
                </>
              ) : (
                <>
                  <p className="text-slate-600 text-sm mb-4">Daftar sebagai peserta (anggota atau admin).</p>
                  {registerError && (
                    <p className="text-red-600 text-sm mb-2">{registerError}</p>
                  )}
                  <button
                    type="button"
                    onClick={handleRegister}
                    disabled={registerLoading}
                    className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                  >
                    {registerLoading ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
                        Memproses...
                      </>
                    ) : (
                      "Daftar Acara"
                    )}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Daftar peserta */}
          <div className="pt-8 border-t border-slate-200">
            <h3 className="text-slate-900 font-bold mb-4">
              Peserta terdaftar ({participants.length})
            </h3>
            {participants.length === 0 ? (
              <p className="text-slate-500 text-sm">Belum ada peserta terdaftar.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {participants.map((p) => (
                  <li key={p.userId} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm shrink-0">
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <span className="font-medium text-slate-800 block truncate">{p.name}</span>
                        <span className="text-slate-500 text-sm font-mono">{p.nim}</span>
                      </div>
                    </div>
                    {p.isAdmin && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-1 rounded shrink-0">
                        Admin
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </article>

        <div className="mt-10 pt-6 border-t border-slate-200">
          <Link
            to="/acara"
            className="text-primary font-semibold hover:underline inline-flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Kembali ke daftar acara
          </Link>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
