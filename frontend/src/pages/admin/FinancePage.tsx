import { useState, useEffect } from "react";

type Transaction = {
  id: string;
  type: "INCOME" | "EXPENSE";
  amount: string;
  description: string | null;
  transactionDate: string;
  category: { value: string } | null;
  user: { name: string };
};

type Summary = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
};

export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary>({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const year = filterMonth.split("-")[0];
      const month = filterMonth.split("-")[1];
      const from = new Date(Number(year), Number(month) - 1, 1).toISOString();
      const to = new Date(Number(year), Number(month), 0, 23, 59, 59).toISOString();
      
      const headers = { "Authorization": `Bearer ${localStorage.getItem("himasi_portal_token")}` };
      
      const [sumRes, txRes] = await Promise.all([
        fetch(`/api/admin/finance/summary?from=${from}&to=${to}`, { headers }),
        fetch(`/api/admin/finance?from=${from}&to=${to}`, { headers })
      ]);

      if (sumRes.ok) setSummary(await sumRes.json());
      if (txRes.ok) setTransactions(await txRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterMonth]);

  const formatRp = (num: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 mb-2">Buku Kas & Keuangan</h1>
          <p className="text-slate-500">Kelola arus kas, donasi, operasional, dan pantau saldo organisasi.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="portal-btn portal-btn-primary flex items-center justify-center gap-2 whitespace-nowrap shadow-md shadow-primary/20"
        >
          <span className="material-symbols-outlined">add</span> Catat Transaksi
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <span className="material-symbols-outlined text-8xl text-green-600">south_west</span>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
              <span className="material-symbols-outlined text-[22px]">south_west</span>
            </div>
            <h3 className="font-semibold text-slate-600">Pemasukan</h3>
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-900">{formatRp(summary.totalIncome)}</p>
            <p className="text-sm text-slate-500 mt-1">Bulan ini</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <span className="material-symbols-outlined text-8xl text-red-600">north_east</span>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
              <span className="material-symbols-outlined text-[22px]">north_east</span>
            </div>
            <h3 className="font-semibold text-slate-600">Pengeluaran</h3>
          </div>
          <div>
            <p className="text-3xl font-bold text-slate-900">{formatRp(summary.totalExpense)}</p>
            <p className="text-sm text-slate-500 mt-1">Bulan ini</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary to-blue-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between relative overflow-hidden text-white">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <span className="material-symbols-outlined text-8xl">account_balance_wallet</span>
          </div>
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <span className="material-symbols-outlined text-[22px]">account_balance_wallet</span>
            </div>
            <h3 className="font-medium text-blue-100">Saldo Saat Ini</h3>
          </div>
          <div className="relative z-10">
            <p className="text-3xl md:text-4xl font-bold">{formatRp(summary.balance)}</p>
            <p className="text-sm text-blue-200 mt-1">Estimasi kas aktif</p>
          </div>
        </div>
      </div>

      {/* Filter & List */}
      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400">receipt_long</span>
            Riwayat Transaksi
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600">Bulan:</span>
            <input 
              type="month" 
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
            />
          </div>
        </div>

        <div className="p-0">
          {loading ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center">
              <span className="material-symbols-outlined animate-spin text-4xl mb-3">refresh</span>
              <p>Memuat data...</p>
            </div>
          ) : transactions.length > 0 ? (
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-100 text-slate-700 uppercase text-[11px] font-bold border-b border-slate-300">
                  <tr>
                    <th className="px-4 py-3 w-32 whitespace-nowrap border-r border-slate-200">Tanggal</th>
                    <th className="px-4 py-3 border-r border-slate-200">Keterangan</th>
                    <th className="px-4 py-3 w-40 text-right border-r border-slate-200 text-green-700 bg-green-50/50">Pemasukan</th>
                    <th className="px-4 py-3 w-40 text-right border-r border-slate-200 text-red-700 bg-red-50/50">Pengeluaran</th>
                    <th className="px-4 py-3 w-16 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-600 border-r border-slate-100">
                        {new Date(t.transactionDate).toLocaleDateString("id-ID", { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 border-r border-slate-100">
                        <div className="font-semibold text-slate-900">{t.description || "-"}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">Oleh: {t.user.name}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-green-600 border-r border-slate-100">
                        {t.type === 'INCOME' ? formatRp(Number(t.amount)) : "-"}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-red-600 border-r border-slate-100">
                        {t.type === 'EXPENSE' ? formatRp(Number(t.amount)) : "-"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button 
                          onClick={async () => {
                            if (confirm("Hapus transaksi ini secara permanen?")) {
                              await fetch(`/api/admin/finance/${t.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('himasi_portal_token')}` } });
                              fetchData();
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                          title="Hapus"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {/* Totals Row */}
                  <tr className="bg-slate-50 font-bold border-t-2 border-slate-300">
                    <td colSpan={2} className="px-4 py-3 text-right border-r border-slate-200 text-slate-700">
                      TOTAL PADA BULAN INI:
                    </td>
                    <td className="px-4 py-3 text-right text-green-700 border-r border-slate-200 bg-green-50/50">
                      {formatRp(summary.totalIncome)}
                    </td>
                    <td className="px-4 py-3 text-right text-red-700 border-r border-slate-200 bg-red-50/50">
                      {formatRp(summary.totalExpense)}
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-16 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                <span className="material-symbols-outlined text-3xl">receipt_long</span>
              </div>
              <h3 className="font-semibold text-slate-700 mb-1">Belum Ada Transaksi</h3>
              <p className="text-sm text-slate-500">Tidak ada catatan keuangan pada bulan {new Date(filterMonth + "-01").toLocaleDateString("id-ID", { month: "long", year: "numeric" })}.</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <TransactionModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => {
            setIsModalOpen(false);
            fetchData();
          }} 
        />
      )}
    </div>
  );
}

function TransactionModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    
    try {
      const form = e.currentTarget;
      const amountRaw = (form.elements.namedItem("amount") as HTMLInputElement).value;
      const amount = Number(amountRaw.replace(/[^0-9]/g, ''));
      
      const payload = {
        type,
        amount,
        description: (form.elements.namedItem("description") as HTMLInputElement).value,
        transactionDate: (form.elements.namedItem("transactionDate") as HTMLInputElement).value + "T12:00:00.000Z",
      };

      const res = await fetch("/api/admin/finance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('himasi_portal_token')}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        onSuccess();
      } else {
        const errData = await res.json().catch(() => null);
        alert("Gagal menyimpan: " + (errData?.message || "Unknown error"));
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  // Auto-format currency while typing
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9]/g, '');
    if (val) {
      e.target.value = new Intl.NumberFormat('id-ID').format(Number(val));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10 flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b bg-slate-50/50">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">edit_document</span>
            Catat Transaksi
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 rounded-lg p-1 bg-white shadow-sm border">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <form id="financeForm" onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col">
          <div className="p-5 space-y-6 flex-1">
            
            {/* Big Toggle for Income / Expense */}
            <div className="flex bg-slate-100 p-1.5 rounded-xl">
              <button 
                type="button" 
                onClick={() => setType("EXPENSE")}
                className={`flex-1 py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all ${type === "EXPENSE" ? "bg-white text-red-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                <span className="material-symbols-outlined text-[20px]">north_east</span>
                Pengeluaran
              </button>
              <button 
                type="button" 
                onClick={() => setType("INCOME")}
                className={`flex-1 py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all ${type === "INCOME" ? "bg-white text-green-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                <span className="material-symbols-outlined text-[20px]">south_west</span>
                Pemasukan
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Nominal (Rp) <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">Rp</span>
                <input 
                  type="text" 
                  name="amount" 
                  required 
                  onChange={handleAmountChange}
                  className={`w-full border rounded-xl pl-12 pr-4 py-3 bg-slate-50 focus:bg-white focus:ring-4 outline-none transition-all text-lg font-bold ${type === 'INCOME' ? 'focus:ring-green-500/20 focus:border-green-500 border-slate-300' : 'focus:ring-red-500/20 focus:border-red-500 border-slate-300'}`} 
                  placeholder="0" 
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Keterangan Transaksi <span className="text-red-500">*</span></label>
              <input type="text" name="description" required className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all" placeholder="Contoh: Beli konsumsi rapat" />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Tanggal <span className="text-red-500">*</span></label>
              <input type="date" name="transactionDate" required defaultValue={new Date().toISOString().slice(0, 10)} className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all" />
            </div>
            
          </div>
          
          <div className="p-5 border-t bg-slate-50 flex justify-end gap-3 mt-auto shrink-0">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 transition-colors" disabled={saving}>Batal</button>
            <button type="submit" className={`px-6 py-2.5 rounded-xl font-bold text-white shadow-md flex items-center gap-2 transition-all ${type === 'INCOME' ? 'bg-green-600 hover:bg-green-700 shadow-green-600/30' : 'bg-primary hover:bg-primary/90 shadow-primary/30'}`} disabled={saving}>
              {saving ? <span className="material-symbols-outlined animate-spin">refresh</span> : 'Simpan Transaksi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
