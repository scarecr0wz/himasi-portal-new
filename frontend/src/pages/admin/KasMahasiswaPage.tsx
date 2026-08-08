import { useState } from 'react';

const IURAN = 5000;

const DUMMY_MEMBERS = [
  { id: '1',  name: 'Budi Santoso',      nim: '220401001', angkatan: '2022' },
  { id: '2',  name: 'Sari Dewi Lestari', nim: '220401002', angkatan: '2022' },
  { id: '3',  name: 'Ahmad Fauzi',        nim: '220401003', angkatan: '2022' },
  { id: '4',  name: 'Rina Kusuma',        nim: '220401004', angkatan: '2022' },
  { id: '5',  name: 'Doni Prasetyo',      nim: '220401005', angkatan: '2022' },
  { id: '6',  name: 'Maya Indah',         nim: '230512001', angkatan: '2023' },
  { id: '7',  name: 'Rizki Ramadhan',     nim: '230512002', angkatan: '2023' },
  { id: '8',  name: 'Fitri Handayani',    nim: '230512003', angkatan: '2023' },
  { id: '9',  name: 'Yoga Pratama',       nim: '230512004', angkatan: '2023' },
  { id: '10', name: 'Nurul Hidayah',      nim: '230512005', angkatan: '2023' },
  { id: '11', name: 'Gilang Permana',     nim: '230512006', angkatan: '2023' },
  { id: '12', name: 'Putri Amalia',       nim: '240133001', angkatan: '2024' },
  { id: '13', name: 'Hendra Wijaya',      nim: '240133002', angkatan: '2024' },
  { id: '14', name: 'Laila Sari',         nim: '240133003', angkatan: '2024' },
  { id: '15', name: 'Fajar Nugroho',      nim: '240133004', angkatan: '2024' },
  { id: '16', name: 'Dewi Anggraeni',     nim: '240133005', angkatan: '2024' },
];

const MONTHS = [
  { label: 'Jan', value: 1 },
  { label: 'Feb', value: 2 },
  { label: 'Mar', value: 3 },
  { label: 'Apr', value: 4 },
  { label: 'Mei', value: 5 },
  { label: 'Jun', value: 6 },
  { label: 'Jul', value: 7 },
  { label: 'Ags', value: 8 },
  { label: 'Sep', value: 9 },
  { label: 'Okt', value: 10 },
  { label: 'Nov', value: 11 },
  { label: 'Des', value: 12 },
];

const formatRp = (n: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(n);

const INITIAL_PAID = new Set(['1', '2', '3', '6', '7', '8', '9', '12', '13']);

export default function KasMahasiswaPage() {
  const now = new Date();
  const [activeMonth, setActiveMonth] = useState<number>(now.getMonth() + 1);
  const [activeYear, setActiveYear] = useState<number>(2026);
  const [paidIds, setPaidIds] = useState<Set<string>>(new Set(INITIAL_PAID));

  const total = DUMMY_MEMBERS.length;
  const paidCount = paidIds.size;
  const terkumpul = paidCount * IURAN;
  const kepatuhan = Math.round((paidCount / total) * 100);
  const canSync = paidCount > 0;

  const togglePaid = (id: string) => {
    setPaidIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Kas Mahasiswa</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Pencatatan iuran kas bulanan anggota HIMASI
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-gray-400 text-xl">calendar_today</span>
          <select
            value={activeYear}
            onChange={(e) => setActiveYear(Number(e.target.value))}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {[2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl shadow-sm p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-green-600 text-xl">payments</span>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
              Terkumpul Bulan Ini
            </p>
            <p className="text-xl font-bold text-gray-800 mt-0.5">{formatRp(terkumpul)}</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl shadow-sm p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-blue-600 text-xl">group</span>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
              Sudah Bayar
            </p>
            <p className="text-xl font-bold text-gray-800 mt-0.5">
              {paidCount}
              <span className="text-sm font-normal text-gray-400">/{total} orang</span>
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl shadow-sm p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-purple-600 text-xl">verified</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Kepatuhan</p>
            <p className="text-xl font-bold text-gray-800 mt-0.5">{kepatuhan}%</p>
            <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${kepatuhan}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Month Pill Row */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="flex flex-wrap gap-2">
          {MONTHS.map((m) => (
            <button
              key={m.value}
              onClick={() => setActiveMonth(m.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeMonth === m.value
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Info Bar + Sync Button */}
      <div className="bg-white rounded-2xl shadow-sm px-5 py-3.5 flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-gray-600">
          Nominal{' '}
          <span className="font-semibold text-gray-800">{formatRp(IURAN)}</span>
          {' · '}Terkumpul{' '}
          <span className="font-semibold text-gray-800">{formatRp(terkumpul)}</span>
          {' · '}
          <span className="font-semibold text-gray-800">{paidCount}</span> dari{' '}
          <span className="font-semibold text-gray-800">{total}</span> anggota sudah bayar
        </p>
        <button
          disabled={!canSync}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            canSync
              ? 'bg-primary text-white hover:opacity-90 cursor-pointer'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          <span className="material-symbols-outlined text-base">
            {canSync ? 'lock' : 'lock'}
          </span>
          Kunci &amp; Sync ke Buku Kas
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">
            Daftar Anggota —{' '}
            {MONTHS.find((m) => m.value === activeMonth)?.label} {activeYear}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
                <th className="px-5 py-3 text-left font-medium">Nama Anggota</th>
                <th className="px-5 py-3 text-left font-medium">NIM</th>
                <th className="px-5 py-3 text-left font-medium">Angkatan</th>
                <th className="px-5 py-3 text-center font-medium">Status</th>
                <th className="px-5 py-3 text-center font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {DUMMY_MEMBERS.map((member) => {
                const isPaid = paidIds.has(member.id);
                return (
                  <tr
                    key={member.id}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-primary">
                            {member.name.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium text-gray-800">{member.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 font-mono text-xs">
                      {member.nim}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          member.angkatan === '2022'
                            ? 'bg-amber-50 text-amber-700'
                            : member.angkatan === '2023'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-teal-50 text-teal-700'
                        }`}
                      >
                        {member.angkatan}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                          <span className="material-symbols-outlined text-xs" style={{ fontSize: '14px' }}>
                            check_circle
                          </span>
                          Lunas
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                          <span className="material-symbols-outlined text-xs" style={{ fontSize: '14px' }}>
                            radio_button_unchecked
                          </span>
                          Belum
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {isPaid ? (
                        <button
                          onClick={() => togglePaid(member.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                            undo
                          </span>
                          Batalkan
                        </button>
                      ) : (
                        <button
                          onClick={() => togglePaid(member.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                            check
                          </span>
                          Tandai Lunas
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
