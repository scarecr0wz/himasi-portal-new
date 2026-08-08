import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

type EventItem = {
  id: string;
  title: string;
  description: string;
  status: "OPEN" | "FINALIZED";
  income: number;
  expense: number;
  createdAt: string;
};

type Transaction = {
  id: string;
  type: "INCOME" | "EXPENSE";
  amount: string;
  description: string;
  transactionDate: string;
  user: { name: string };
};

const DUMMY_EVENTS: EventItem[] = [
  { id: "1", title: "Seminar Nasional Informatika 2026", description: "Seminar tahunan HIMASI UTB", status: "OPEN", income: 1500000, expense: 820000, createdAt: "2026-07-01" },
  { id: "2", title: "Ospek Mahasiswa Baru 2026", description: "Orientasi anggota baru HIMASI", status: "OPEN", income: 800000, expense: 650000, createdAt: "2026-06-15" },
  { id: "3", title: "Gathering Akhir Tahun 2025", description: "Acara penutupan tahun kepengurusan", status: "FINALIZED", income: 500000, expense: 450000, createdAt: "2025-12-10" },
  { id: "4", title: "Lomba Coding Internal 2025", description: "Kompetisi programming antar anggota", status: "FINALIZED", income: 300000, expense: 280000, createdAt: "2025-10-05" },
];

const DUMMY_TRANSACTIONS: Record<string, Transaction[]> = {
  "1": [
    { id: "t1", type: "INCOME", amount: "1000000", description: "Tiket peserta seminar (100 orang)", transactionDate: "2026-07-10", user: { name: "Admin" } },
    { id: "t2", type: "INCOME", amount: "500000", description: "Sponsor dari perusahaan IT", transactionDate: "2026-07-12", user: { name: "Admin" } },
    { id: "t3", type: "EXPENSE", amount: "400000", description: "Sewa aula kampus", transactionDate: "2026-07-15", user: { name: "Admin" } },
    { id: "t4", type: "EXPENSE", amount: "250000", description: "Konsumsi panitia dan peserta", transactionDate: "2026-07-15", user: { name: "Admin" } },
    { id: "t5", type: "EXPENSE", amount: "170000", description: "Cetak banner dan spanduk", transactionDate: "2026-07-14", user: { name: "Admin" } },
  ],
  "2": [
    { id: "t6", type: "INCOME", amount: "800000", description: "Iuran peserta ospek (80 orang)", transactionDate: "2026-06-20", user: { name: "Admin" } },
    { id: "t7", type: "EXPENSE", amount: "350000", description: "Konsumsi 3 hari", transactionDate: "2026-06-22", user: { name: "Admin" } },
    { id: "t8", type: "EXPENSE", amount: "300000", description: "Perlengkapan games dan hadiah", transactionDate: "2026-06-21", user: { name: "Admin" } },
  ],
  "3": [
    { id: "t9", type: "INCOME", amount: "500000", description: "Tiket gathering", transactionDate: "2025-12-15", user: { name: "Admin" } },
    { id: "t10", type: "EXPENSE", amount: "450000", description: "Sewa venue dan dekorasi", transactionDate: "2025-12-20", user: { name: "Admin" } },
  ],
  "4": [
    { id: "t11", type: "INCOME", amount: "300000", description: "Registrasi peserta lomba", transactionDate: "2025-10-08", user: { name: "Admin" } },
    { id: "t12", type: "EXPENSE", amount: "280000", description: "Hadiah juara 1, 2, 3", transactionDate: "2025-10-10", user: { name: "Admin" } },
  ],
};

const formatRp = (num: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);

export default function KasEventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const event = DUMMY_EVENTS.find((e) => e.id === id);
  const [transactions, setTransactions] = useState<Transaction[]>(
    id ? (DUMMY_TRANSACTIONS[id] ?? []) : []
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!event) {
    return (
      <div className="p-8 text-center text-slate-500">
        <span className="material-symbols-outlined text-5xl block mb-3 text-slate-300">event_busy</span>
        Kas event tidak ditemukan.
        <button onClick={() => navigate("/admin/kas-event")} className="block mx-auto mt-4 text-primary font-semibold hover:underline">
          ← Kembali
        </button>
      </div>
    );
  }

  const isFinalized = event.status === "FINALIZED";

  const totalIncome = transactions.filter((t) => t.type === "INCOME").reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = transactions.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + Number(t.amount), 0);
  const saldo = totalIncome - totalExpense;

  const handleAddTransaction = (tx: Omit<Transaction, "id">) => {
    setTransactions((prev) => [
      ...prev,
      { ...tx, id: `local-${Date.now()}` },
    ]);
    setIsModalOpen(false);
  };

  const handleDelete = (txId: string) => {
    if (confirm("Hapus transaksi ini?")) {
      setTransactions((prev) => prev.filter((t) => t.id !== txId));
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 animate-fade-in pb-20">
      {/* Back + Header */}
      <div>
        <button
          onClick={() => navigate("/admin/kas-event")}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 transition-colors mb-4 font-medium"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Kas Event
        </button>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
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
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">{event.title}</h1>
            <p className="text-slate-500 mt-1">{event.description}</p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 shrink-0">
            {!isFinalized && (
              <button
                onClick={() => setIsModalOpen(true)}
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
                + Catat Transaksi
              </button>
            )}
            <div className="relative group">
              <button
                disabled={isFinalized}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm border transition-colors ${
                  isFinalized
                    ? "border-slate-200 text-slate-300 bg-slate-50 cursor-not-allowed"
                    : "border-primary text-primary hover:bg-primary/5 cursor-pointer"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">sync</span>
                Finalisasi & Sync ke Buku Kas
              </button>
              {isFinalized && (
                <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  Kas event ini sudah difinalisasi.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Finalized banner */}
      {isFinalized && (
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl p-4 text-sm">
          <span className="material-symbols-outlined text-[20px] text-blue-500 shrink-0 mt-0.5">info</span>
          <p>Kas event ini telah difinalisasi dan disinkronkan ke <strong>Buku Kas Utama</strong>. Data tidak dapat diubah.</p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
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
            <p className="text-3xl font-bold text-slate-900">{formatRp(totalIncome)}</p>
            <p className="text-sm text-slate-500 mt-1">Total pemasukan event</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
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
            <p className="text-3xl font-bold text-slate-900">{formatRp(totalExpense)}</p>
            <p className="text-sm text-slate-500 mt-1">Total pengeluaran event</p>
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
            <h3 className="font-medium text-blue-100">Saldo Event</h3>
          </div>
          <div className="relative z-10">
            <p className="text-3xl md:text-4xl font-bold">{formatRp(saldo)}</p>
            <p className="text-sm text-blue-200 mt-1">Sisa kas event</p>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 flex items-center justify-between gap-4 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400">receipt_long</span>
            Daftar Transaksi
          </h2>
          {!isFinalized && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              Tambah
            </button>
          )}
        </div>

        {transactions.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
              <span className="material-symbols-outlined text-3xl">receipt_long</span>
            </div>
            <h3 className="font-semibold text-slate-700 mb-1">Belum Ada Transaksi</h3>
            <p className="text-sm text-slate-500">Belum ada catatan keuangan untuk event ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-slate-700 uppercase text-[11px] font-bold">
                <tr>
                  <th className="px-4 py-3 w-36 whitespace-nowrap">Tanggal</th>
                  <th className="px-4 py-3">Keterangan</th>
                  <th className="px-4 py-3 w-40 text-right text-green-700">Pemasukan</th>
                  <th className="px-4 py-3 w-40 text-right text-red-700">Pengeluaran</th>
                  <th className="px-4 py-3 w-16 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-600">
                      {new Date(t.transactionDate).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{t.description}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">Oleh: {t.user.name}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-green-600">
                      {t.type === "INCOME" ? formatRp(Number(t.amount)) : "-"}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-red-600">
                      {t.type === "EXPENSE" ? formatRp(Number(t.amount)) : "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {!isFinalized && (
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                          title="Hapus"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {/* Totals Row */}
                <tr className="bg-slate-50/50 font-bold">
                  <td colSpan={2} className="px-4 py-3 text-right text-slate-700">TOTAL:</td>
                  <td className="px-4 py-3 text-right text-green-700">{formatRp(totalIncome)}</td>
                  <td className="px-4 py-3 text-right text-red-700">{formatRp(totalExpense)}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <EventTransactionModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleAddTransaction}
        />
      )}
    </div>
  );
}

function EventTransactionModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (tx: Omit<Transaction, "id">) => void;
}) {
  const [type, setType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [saving, setSaving] = useState(false);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^0-9]/g, "");
    if (val) {
      e.target.value = new Intl.NumberFormat("id-ID").format(Number(val));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const form = e.currentTarget;
    const amountRaw = (form.elements.namedItem("amount") as HTMLInputElement).value;
    const amount = String(Number(amountRaw.replace(/[^0-9]/g, "")));
    const description = (form.elements.namedItem("description") as HTMLInputElement).value;
    const transactionDate = (form.elements.namedItem("transactionDate") as HTMLInputElement).value;

    setTimeout(() => {
      onSuccess({ type, amount, description, transactionDate, user: { name: "Admin" } });
      setSaving(false);
    }, 300);
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

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col">
          <div className="p-5 space-y-6 flex-1">
            {/* Toggle */}
            <div className="flex bg-slate-100 p-1.5 rounded-xl">
              <button
                type="button"
                onClick={() => setType("EXPENSE")}
                className={`flex-1 py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                  type === "EXPENSE" ? "bg-white text-red-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">north_east</span>
                Pengeluaran
              </button>
              <button
                type="button"
                onClick={() => setType("INCOME")}
                className={`flex-1 py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                  type === "INCOME" ? "bg-white text-green-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
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
                  className={`w-full border-0 rounded-none pl-12 pr-4 py-3 bg-slate-50 focus:bg-white focus:ring-4 outline-none transition-all text-lg font-bold ${
                    type === "INCOME" ? "focus:ring-green-500/20" : "focus:ring-red-500/20"
                  }`}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Keterangan <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="description"
                required
                className="w-full border-0 rounded-none px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                placeholder="Contoh: Beli konsumsi rapat"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Tanggal <span className="text-red-500">*</span></label>
              <input
                type="date"
                name="transactionDate"
                required
                defaultValue={new Date().toISOString().slice(0, 10)}
                className="w-full border-0 rounded-none px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/50 outline-none transition-all"
              />
            </div>
          </div>

          <div className="p-5 border-t bg-slate-50 flex justify-end gap-3 mt-auto shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
              disabled={saving}
            >
              Batal
            </button>
            <button
              type="submit"
              className={`px-6 py-2.5 rounded-xl font-bold text-white shadow-md flex items-center gap-2 transition-all ${
                type === "INCOME"
                  ? "bg-green-600 hover:bg-green-700 shadow-green-600/30"
                  : "bg-primary hover:bg-primary/90 shadow-primary/30"
              }`}
              disabled={saving}
            >
              {saving ? <span className="material-symbols-outlined animate-spin">refresh</span> : "Simpan Transaksi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
