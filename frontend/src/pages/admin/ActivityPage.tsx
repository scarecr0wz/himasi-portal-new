import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type Activity = {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  isActive: boolean;
  departemen: { id: string; title: string } | null;
  _count: { participations: number };
};

type Department = { id: string; title: string };

export default function ActivityPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState<Activity | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [actRes, depRes] = await Promise.all([
        fetch('/api/admin/activities', { headers: { 'Authorization': `Bearer ${localStorage.getItem('himasi_portal_token')}` } }),
        fetch('/api/admin/activities/departments', { headers: { 'Authorization': `Bearer ${localStorage.getItem('himasi_portal_token')}` } })
      ]);
      
      if (actRes.ok) setActivities(await actRes.json());
      if (depRes.ok) setDepartments(await depRes.json());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus acara ini permanen?")) return;
    try {
      await fetch(`/api/admin/activities/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem('himasi_portal_token')}` }
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      <div className="flex-none p-6 md:p-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Acara & Kegiatan</h1>
          <p className="text-slate-500 text-sm mt-1">Kelola publikasi acara HIMA SI dan daftar partisipan</p>
        </div>
        <button
          onClick={() => { setEditData(null); setShowModal(true); }}
          className="inline-flex items-center gap-2 bg-[var(--accent)] hover:opacity-90 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Buat Acara Baru
        </button>
      </div>

      <div className="flex-1 px-6 md:px-8 pb-8">
        {loading ? (
          <p className="text-center text-slate-400 py-12">Memuat data acara...</p>
        ) : activities.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
            <span className="material-symbols-outlined text-4xl text-slate-300 mb-4">event_busy</span>
            <h3 className="text-lg font-bold text-slate-700">Belum Ada Acara</h3>
            <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">
              Silakan buat acara baru untuk menampilkannya di halaman pendaftaran mahasiswa.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {activities.map(act => (
              <div key={act.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow relative flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${act.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {act.isActive ? 'PUBLISHED' : 'DRAFT'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setEditData(act); setShowModal(true); }} className="p-1.5 text-slate-400 hover:text-primary rounded-lg hover:bg-primary/5 transition-colors" title="Edit Data">
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button onClick={() => handleDelete(act.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors" title="Hapus">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-slate-800 leading-tight mb-2">{act.title}</h3>
                <div className="text-xs text-slate-500 font-medium mb-4 flex-1">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                    {new Date(act.startAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">corporate_fare</span>
                    {act.departemen?.title || "Semua Departemen (HIMA SI)"}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
                  <div className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-slate-400 text-[18px]">group</span>
                    {act._count?.participations || 0} Pendaftar
                  </div>
                  <Link
                    to={`/admin/activities/${act.id}`}
                    className="text-primary hover:text-primary/80 text-sm font-bold flex items-center gap-1"
                  >
                    Kelola Partisipan
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <ActivityModal
          editData={editData}
          departments={departments}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchData(); }}
        />
      )}
    </div>
  );
}

function ActivityModal({ editData, departments, onClose, onSuccess }: { editData: Activity | null, departments: Department[], onClose: () => void, onSuccess: () => void }) {
  const [title, setTitle] = useState(editData?.title || "");
  const [desc] = useState(editData ? "" : ""); // In a real app we fetch full detail, but here we can just update title for MVP
  const [startAt, setStartAt] = useState(editData ? new Date(editData.startAt).toISOString().slice(0, 16) : "");
  const [endAt, setEndAt] = useState(editData ? new Date(editData.endAt).toISOString().slice(0, 16) : "");
  const [departemenId, setDepartemenId] = useState(editData?.departemen?.id || "");
  const [isActive, setIsActive] = useState(editData ? editData.isActive : true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editData ? `/api/admin/activities/${editData.id}` : "/api/admin/activities";
      const method = editData ? "PUT" : "POST";
      const payload = { title, desc, startAt, endAt, departemenId, isActive };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('himasi_portal_token')}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) onSuccess();
      else alert("Gagal menyimpan acara");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-full">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-bold text-lg text-slate-800">{editData ? "Edit Acara" : "Buat Acara Baru"}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><span className="material-symbols-outlined">close</span></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Judul Acara</label>
            <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border-0 focus:ring-2 focus:ring-primary/50 outline-none transition-all" placeholder="Contoh: Seminar IT Nasional" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Waktu Mulai</label>
              <input required type="datetime-local" value={startAt} onChange={e => setStartAt(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border-0 focus:ring-2 focus:ring-primary/50 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Waktu Selesai</label>
              <input required type="datetime-local" value={endAt} onChange={e => setEndAt(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border-0 focus:ring-2 focus:ring-primary/50 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Departemen Pelaksana</label>
            <select value={departemenId} onChange={e => setDepartemenId(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border-0 focus:ring-2 focus:ring-primary/50 outline-none">
              <option value="">-- Pilih Departemen (Opsional) --</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status Publikasi</label>
            <div className="flex items-center gap-3 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={isActive} onChange={() => setIsActive(true)} name="status" className="accent-primary" />
                <span className="text-sm text-slate-700 font-medium">Published (Aktif)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={!isActive} onChange={() => setIsActive(false)} name="status" className="accent-primary" />
                <span className="text-sm text-slate-700 font-medium">Draft (Sembunyikan)</span>
              </label>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">Batal</button>
            <button type="submit" className="px-5 py-2.5 text-sm font-bold text-white bg-[var(--accent)] hover:opacity-90 rounded-xl transition-opacity">Simpan Acara</button>
          </div>
        </form>
      </div>
    </div>
  );
}
