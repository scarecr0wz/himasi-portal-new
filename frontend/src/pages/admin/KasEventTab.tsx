import { useState, useEffect } from 'react';

type EventStatus = 'OPEN' | 'FINALIZED';

type EventKas = {
  id: string;
  title: string;
  description: string;
  status: EventStatus;
  income: number;
  expense: number;
  createdAt: string;
};

type Transaction = {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string;
  transactionDate: string;
};

const formatRp = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

export function KasEventTab() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [events, setEvents] = useState<EventKas[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/event-kas', {
        headers: { Authorization: `Bearer ${localStorage.getItem('himasi_portal_token')}` }
      });
      if (res.ok) {
        setEvents(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/event-kas/${id}/transactions`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('himasi_portal_token')}` }
      });
      if (res.ok) {
        setTransactions(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!selectedId) {
      fetchEvents();
    } else {
      fetchTransactions(selectedId);
    }
  }, [selectedId]);

  if (selectedId) {
    const ev = events.find(e => e.id === selectedId);
    if (!ev) return null;
    
    const income = transactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0);
    const expense = transactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0);
    const saldo = income - expense;

    const handleFinalize = async () => {
      if (ev.status === 'FINALIZED') return;
      if (confirm(`Finalisasi "${ev.title}"?\nSaldo ${formatRp(saldo)} akan dicatat sebagai ${saldo >= 0 ? 'Pemasukan' : 'Pengeluaran'} di Buku Kas Utama.`)) {
        try {
          const res = await fetch(`/api/admin/event-kas/${ev.id}/finalize`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${localStorage.getItem('himasi_portal_token')}` }
          });
          if (res.ok) {
            alert("Kas event difinalisasi!");
            setSelectedId(null);
          } else {
            const data = await res.json();
            alert(data.message || "Gagal finalisasi");
          }
        } catch (err) {
          console.error(err);
        }
      }
    };

    return (
      <div className="space-y-6">
        {/* Back + header */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setSelectedId(null)}
            className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Kembali
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <h2 className="text-lg font-bold text-slate-800">{ev.title}</h2>
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
            ev.status === 'OPEN'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-slate-100 text-slate-500'
          }`}>
            {ev.status === 'FINALIZED' && <span className="material-symbols-outlined text-[12px]">lock</span>}
            {ev.status}
          </span>
          {ev.status === 'OPEN' && (
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setIsTxModalOpen(true)}
                className="text-sm font-semibold px-4 py-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors flex items-center gap-1.5"
              >
                + Transaksi
              </button>
              <button
                onClick={handleFinalize}
                className="text-sm font-semibold px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">sync</span>
                Finalisasi & Sync
              </button>
            </div>
          )}
        </div>

        {/* Finalized banner */}
        {ev.status === 'FINALIZED' && (
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700">
            <span className="material-symbols-outlined text-emerald-600">check_circle</span>
            Kas event ini telah difinalisasi dan disinkronkan ke Buku Kas Utama.
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600 text-[18px]">south_west</span>
              </div>
              <span className="text-sm font-semibold text-slate-600">Pemasukan</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{formatRp(income)}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-red-600 text-[18px]">north_east</span>
              </div>
              <span className="text-sm font-semibold text-slate-600">Pengeluaran</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{formatRp(expense)}</p>
          </div>
          <div className={`rounded-2xl p-5 shadow-sm ${
            saldo >= 0 ? 'bg-gradient-to-br from-primary to-blue-700 text-white' : 'bg-gradient-to-br from-red-600 to-red-800 text-white'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">{saldo >= 0 ? 'account_balance' : 'trending_down'}</span>
              </div>
              <span className="text-sm font-semibold opacity-90">Saldo Event</span>
            </div>
            <p className="text-2xl font-bold">{formatRp(Math.abs(saldo))}</p>
            <p className="text-xs opacity-70 mt-0.5">{saldo >= 0 ? 'Surplus' : 'Defisit'}</p>
          </div>
        </div>

        {/* Transaction table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 flex items-center justify-between border-b border-slate-100">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-400">receipt_long</span>
              Rincian Transaksi
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-left">Tanggal</th>
                  <th className="px-4 py-3 text-left">Keterangan</th>
                  <th className="px-4 py-3 text-right text-green-700">Pemasukan</th>
                  <th className="px-4 py-3 text-right text-red-700">Pengeluaran</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? transactions.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                      {new Date(t.transactionDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">{t.description}</td>
                    <td className="px-4 py-3 text-right font-semibold text-green-600">
                      {t.type === 'INCOME' ? formatRp(Number(t.amount)) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-red-600">
                      {t.type === 'EXPENSE' ? formatRp(Number(t.amount)) : '—'}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-400">Belum ada transaksi</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50 font-bold">
                  <td colSpan={2} className="px-4 py-3 text-right text-slate-600">TOTAL:</td>
                  <td className="px-4 py-3 text-right text-green-700">{formatRp(income)}</td>
                  <td className="px-4 py-3 text-right text-red-700">{formatRp(expense)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {isTxModalOpen && (
          <CreateTxModal 
            eventId={ev.id}
            onClose={() => setIsTxModalOpen(false)}
            onSuccess={() => {
              setIsTxModalOpen(false);
              fetchTransactions(selectedId);
            }}
          />
        )}
      </div>
    );
  }

  // ── Event list ──
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{events.filter(e => e.status === 'OPEN').length} aktif &ensp;·&ensp; {events.filter(e => e.status === 'FINALIZED').length} selesai</p>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          style={{ padding: '0.4rem 0.9rem', background: 'var(--accent)', color: 'white', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
        >
          + Buat Kas Event
        </button>
      </div>

      {loading ? (
        <p className="text-slate-400 text-sm py-4">Memuat data...</p>
      ) : events.length === 0 ? (
        <div className="text-center py-12 text-slate-400 bg-white rounded-2xl shadow-sm">Belum ada kas event.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map(ev => {
            const saldo = Number(ev.income) - Number(ev.expense);
            return (
              <div
                key={ev.id}
                onClick={() => setSelectedId(ev.id)}
                className="bg-white rounded-2xl shadow-sm p-5 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all group"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-base leading-tight group-hover:text-primary transition-colors">{ev.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">{ev.description || "Tidak ada deskripsi"}</p>
                  </div>
                  <span className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    ev.status === 'OPEN'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {ev.status === 'FINALIZED' && <span className="material-symbols-outlined" style={{fontSize:'11px'}}>lock</span>}
                    {ev.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-slate-400 font-medium">Pemasukan</p>
                    <p className="font-bold text-green-600 mt-0.5">{formatRp(Number(ev.income))}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">Pengeluaran</p>
                    <p className="font-bold text-red-600 mt-0.5">{formatRp(Number(ev.expense))}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">Saldo</p>
                    <p className={`font-bold mt-0.5 ${saldo >= 0 ? 'text-primary' : 'text-red-600'}`}>{formatRp(saldo)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-end mt-4 text-xs text-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Lihat Detail <span className="material-symbols-outlined text-[14px] ml-0.5">arrow_forward</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isCreateModalOpen && (
        <CreateEventModal 
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            fetchEvents();
          }}
        />
      )}
    </div>
  );
}

function CreateEventModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/event-kas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('himasi_portal_token')}`
        },
        body: JSON.stringify({ title, description: desc })
      });
      if (res.ok) {
        onSuccess();
      } else {
        const d = await res.json();
        alert(d.message || 'Gagal membuat event');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-zoom-in">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">Buat Kas Event Baru</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><span className="material-symbols-outlined">close</span></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Judul Event / Kas</label>
            <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none" placeholder="Mis. Seminar Nasional 2026" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Deskripsi Singkat</label>
            <textarea rows={3} value={desc} onChange={e => setDesc(e.target.value)} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none" placeholder="Deskripsi..." />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">Batal</button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-colors">{loading ? 'Menyimpan...' : 'Buat Kas Event'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CreateTxModal({ eventId, onClose, onSuccess }: { eventId: string, onClose: () => void, onSuccess: () => void }) {
  const [type, setType] = useState<'INCOME'|'EXPENSE'>('INCOME');
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/event-kas/${eventId}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('himasi_portal_token')}`
        },
        body: JSON.stringify({ type, amount, description: desc, transactionDate: date })
      });
      if (res.ok) {
        onSuccess();
      } else {
        const d = await res.json();
        alert(d.message || 'Gagal menyimpan transaksi');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-zoom-in">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">Catat Transaksi Event</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><span className="material-symbols-outlined">close</span></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button type="button" onClick={() => setType('INCOME')} className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all ${type === 'INCOME' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500'}`}>Pemasukan</button>
            <button type="button" onClick={() => setType('EXPENSE')} className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all ${type === 'EXPENSE' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'}`}>Pengeluaran</button>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Nominal (Rp)</label>
            <input type="number" required value={amount} onChange={e => setAmount(e.target.value)} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none" placeholder="0" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Keterangan</label>
            <input type="text" required value={desc} onChange={e => setDesc(e.target.value)} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none" placeholder="Mis. Tiket registrasi" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Tanggal</label>
            <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary/50 outline-none" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">Batal</button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-colors">{loading ? 'Menyimpan...' : 'Simpan Transaksi'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
