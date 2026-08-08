import { useNavigate } from "react-router-dom";

type EventItem = {
  id: string;
  title: string;
  description: string;
  status: "OPEN" | "FINALIZED";
  income: number;
  expense: number;
  createdAt: string;
};

const DUMMY_EVENTS: EventItem[] = [
  { id: "1", title: "Seminar Nasional Informatika 2026", description: "Seminar tahunan HIMASI UTB", status: "OPEN", income: 1500000, expense: 820000, createdAt: "2026-07-01" },
  { id: "2", title: "Ospek Mahasiswa Baru 2026", description: "Orientasi anggota baru HIMASI", status: "OPEN", income: 800000, expense: 650000, createdAt: "2026-06-15" },
  { id: "3", title: "Gathering Akhir Tahun 2025", description: "Acara penutupan tahun kepengurusan", status: "FINALIZED", income: 500000, expense: 450000, createdAt: "2025-12-10" },
  { id: "4", title: "Lomba Coding Internal 2025", description: "Kompetisi programming antar anggota", status: "FINALIZED", income: 300000, expense: 280000, createdAt: "2025-10-05" },
];

const formatRp = (num: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);

export default function KasEventPage() {
  const navigate = useNavigate();

  return (
    <div className="p-6 md:p-8 space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 mb-2">Kas Event</h1>
          <p className="text-slate-500">Kelola keuangan per event secara terpisah sebelum disinkronkan ke Buku Kas Utama.</p>
        </div>
        <button
          style={{
            padding: "0.5rem 1rem",
            background: "var(--accent)",
            color: "white",
            borderRadius: "8px",
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: "0.25rem",
            whiteSpace: "nowrap",
          }}
        >
          + Buat Kas Event
        </button>
      </div>

      {/* Grid */}
      {DUMMY_EVENTS.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-16 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
            <span className="material-symbols-outlined text-3xl">event_note</span>
          </div>
          <h3 className="font-semibold text-slate-700 mb-1">Belum Ada Kas Event</h3>
          <p className="text-sm text-slate-500">Buat kas event baru untuk mulai mencatat keuangan per acara.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {DUMMY_EVENTS.map((event) => {
            const saldo = event.income - event.expense;
            const isFinalized = event.status === "FINALIZED";

            return (
              <div
                key={event.id}
                onClick={() => navigate(`/admin/kas-event/${event.id}`)}
                className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4 cursor-pointer hover:shadow-md transition-shadow group"
              >
                {/* Badge + Title */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {isFinalized ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
                          <span className="material-symbols-outlined text-[14px]">lock</span>
                          FINALIZED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          <span className="material-symbols-outlined text-[14px]">lock_open</span>
                          OPEN
                        </span>
                      )}
                      <span className="text-xs text-slate-400">
                        {new Date(event.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    </div>
                    <h2 className="font-bold text-slate-900 text-base leading-snug group-hover:text-primary transition-colors truncate">
                      {event.title}
                    </h2>
                    <p className="text-sm text-slate-500 mt-0.5 truncate">{event.description}</p>
                  </div>
                </div>

                {/* Financial summary */}
                <div className="grid grid-cols-3 gap-3 mt-1">
                  <div className="bg-green-50 rounded-xl p-3">
                    <p className="text-[10px] font-semibold text-green-600 uppercase tracking-wide mb-1">Pemasukan</p>
                    <p className="text-sm font-bold text-green-700">{formatRp(event.income)}</p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-3">
                    <p className="text-[10px] font-semibold text-red-600 uppercase tracking-wide mb-1">Pengeluaran</p>
                    <p className="text-sm font-bold text-red-700">{formatRp(event.expense)}</p>
                  </div>
                  <div className={`rounded-xl p-3 ${saldo >= 0 ? "bg-blue-50" : "bg-orange-50"}`}>
                    <p className={`text-[10px] font-semibold uppercase tracking-wide mb-1 ${saldo >= 0 ? "text-blue-600" : "text-orange-600"}`}>Saldo</p>
                    <p className={`text-sm font-bold ${saldo >= 0 ? "text-blue-700" : "text-orange-700"}`}>{formatRp(saldo)}</p>
                  </div>
                </div>

                {/* Action */}
                <div className="flex justify-end pt-1 border-t border-slate-100">
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/admin/kas-event/${event.id}`); }}
                    className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-primary transition-colors"
                  >
                    Lihat Detail
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
