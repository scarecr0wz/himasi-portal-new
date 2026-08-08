import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

type Participant = {
  id: string;
  userId: string;
  activityId: string;
  attended: boolean;
  participatedAt: string;
  user: { id: string; name: string; nim: string };
};

type ActivityDetail = {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  isActive: boolean;
  departemen: { id: string; title: string } | null;
  participations: Participant[];
};

type UserResult = { id: string; name: string; nim: string };

export default function ActivityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activity, setActivity] = useState<ActivityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  
  // For manual participant add
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);

  const fetchDetail = async () => {
    try {
      const res = await fetch(`/api/admin/activities/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('himasi_portal_token')}` }
      });
      if (res.ok) setActivity(await res.json());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  useEffect(() => {
    if (searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }
    const search = async () => {
      try {
        const res = await fetch(`/api/admin/activities/${id}/search-users?q=${searchQuery}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('himasi_portal_token')}` }
        });
        if (res.ok) setSearchResults(await res.json());
      } catch (e) {}
    };
    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, id]);

  const addParticipant = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/activities/${id}/participants`, {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('himasi_portal_token')}`
        },
        body: JSON.stringify({ userId })
      });
      if (!res.ok) {
        const error = await res.json();
        alert(error.message || "Gagal menambahkan");
      } else {
        setSearchQuery("");
        fetchDetail();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const removeParticipant = async (userId: string) => {
    if (!confirm("Hapus peserta ini?")) return;
    try {
      await fetch(`/api/admin/activities/${id}/participants/${userId}`, {
        method: "DELETE",
        headers: { 'Authorization': `Bearer ${localStorage.getItem('himasi_portal_token')}` }
      });
      fetchDetail();
    } catch (e) { console.error(e); }
  };

  const toggleAttendance = async (userId: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/admin/activities/${id}/participants/${userId}/attendance`, {
        method: "PUT",
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('himasi_portal_token')}`
        },
        body: JSON.stringify({ attended: !currentStatus })
      });
      fetchDetail();
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="p-8">Memuat...</div>;
  if (!activity) return <div className="p-8">Acara tidak ditemukan.</div>;

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      
      {/* Header Dashboard */}
      <div className="flex-none p-6 md:px-8 md:pt-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Link to="/admin/activities" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-primary mb-3 transition-colors">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Kembali ke Daftar Acara
          </Link>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight leading-tight">{activity.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">calendar_today</span>
              {new Date(activity.startAt).toLocaleDateString('id-ID')}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">corporate_fare</span>
              {activity.departemen?.title || "HIMA SI"}
            </div>
          </div>
        </div>

        <button
          onClick={() => alert("Fitur Kas Event belum terhubung di UI (Tahap Selanjutnya)")}
          className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
          Buat Kas Event Ini
        </button>
      </div>

      <div className="flex-1 px-6 md:px-8 py-6 flex flex-col gap-6 md:flex-row">
        
        {/* Main Area: Participant List */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 className="font-bold text-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">groups</span>
              Daftar Partisipan ({activity.participations.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Mahasiswa</th>
                  <th className="px-6 py-4">Waktu Daftar</th>
                  <th className="px-6 py-4 text-center">Kehadiran</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activity.participations.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400">Belum ada partisipan.</td>
                  </tr>
                ) : (
                  activity.participations.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3">
                        <div className="font-bold text-slate-800">{p.user.name}</div>
                        <div className="text-xs text-slate-500">{p.user.nim}</div>
                      </td>
                      <td className="px-6 py-3 text-slate-500">
                        {new Date(p.participatedAt).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <button
                          onClick={() => toggleAttendance(p.userId, p.attended)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                            p.attended ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {p.attended ? "check_circle" : "cancel"}
                          </span>
                          {p.attended ? "Hadir" : "Belum Hadir"}
                        </button>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button onClick={() => removeParticipant(p.userId)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors" title="Hapus Partisipan">
                          <span className="material-symbols-outlined text-[18px]">person_remove</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar: Add Participant */}
        <div className="w-full md:w-80 flex flex-col gap-6 shrink-0">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm">
              <span className="material-symbols-outlined text-[18px] text-primary">person_add</span>
              Tambah Partisipan Manual
            </h3>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">search</span>
              <input
                type="text"
                placeholder="Cari Nama / NIM..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-primary/50 outline-none text-sm"
              />
            </div>
            
            {searchResults.length > 0 && (
              <div className="mt-3 border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-50">
                {searchResults.map(u => (
                  <div key={u.id} className="p-3 bg-white hover:bg-slate-50 flex items-center justify-between group transition-colors">
                    <div className="min-w-0 pr-2">
                      <div className="font-bold text-slate-800 text-xs truncate">{u.name}</div>
                      <div className="text-[10px] text-slate-500">{u.nim}</div>
                    </div>
                    <button
                      onClick={() => addParticipant(u.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-all shrink-0"
                    >
                      <span className="material-symbols-outlined text-[14px]">add</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="bg-primary/5 rounded-2xl border border-primary/10 p-5 text-sm text-primary">
            <div className="font-bold mb-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">info</span>
              Info Penting
            </div>
            <p className="leading-relaxed opacity-90">
              Fitur pendaftaran manual ini digunakan jika mahasiswa mengalami kendala mendaftar secara mandiri melalui Portal Mahasiswa.
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );
}
