import { useState } from 'react';

const IURAN = 5000;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

const DUMMY_MEMBERS = [
  { id: '1',  name: 'Budi Santoso',      nim: '220401001' },
  { id: '2',  name: 'Sari Dewi Lestari', nim: '220401002' },
  { id: '3',  name: 'Ahmad Fauzi',       nim: '220401003' },
  { id: '4',  name: 'Rina Kusuma',       nim: '220401004' },
  { id: '5',  name: 'Doni Prasetyo',     nim: '220401005' },
  { id: '6',  name: 'Maya Indah',        nim: '230512001' },
  { id: '7',  name: 'Rizki Ramadhan',    nim: '230512002' },
  { id: '8',  name: 'Fitri Handayani',   nim: '230512003' },
  { id: '9',  name: 'Yoga Pratama',      nim: '230512004' },
  { id: '10', name: 'Nurul Hidayah',     nim: '230512005' },
  { id: '11', name: 'Gilang Permana',    nim: '230512006' },
  { id: '12', name: 'Putri Amalia',      nim: '240133001' },
  { id: '13', name: 'Hendra Wijaya',     nim: '240133002' },
  { id: '14', name: 'Laila Sari',        nim: '240133003' },
  { id: '15', name: 'Fajar Nugroho',     nim: '240133004' },
  { id: '16', name: 'Dewi Anggraeni',    nim: '240133005' },
];

const INITIAL_PAID: Record<string, Set<number>> = {
  '1':  new Set([1, 2, 3, 4, 5, 6, 7]),
  '2':  new Set([1, 2, 3, 5]),
  '3':  new Set([1, 2, 3, 4, 6]),
  '4':  new Set([1, 3, 5]),
  '5':  new Set([1, 2]),
  '6':  new Set([1, 2, 3, 4, 5, 6, 7]),
  '7':  new Set([1, 2, 3, 4]),
  '8':  new Set([1, 2, 4, 5, 6]),
  '9':  new Set([1, 3, 4, 5]),
  '10': new Set([1, 2, 3]),
  '11': new Set([2, 3, 4]),
  '12': new Set([1, 2, 3, 4, 5]),
  '13': new Set([1, 3, 5, 6]),
  '14': new Set([1, 2]),
  '15': new Set([1, 4]),
  '16': new Set([1, 2, 3, 4, 5, 6]),
};

const formatRp = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

export function KasMahasiswaTab() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const [activeYear, setActiveYear] = useState(2026);
  const [paidMap, setPaidMap] = useState<Record<string, Set<number>>>(INITIAL_PAID);
  const [syncedMonths, setSyncedMonths] = useState<Set<number>>(new Set([1, 2, 3]));

  const toggle = (memberId: string, month: number) => {
    if (month > currentMonth) return;
    setPaidMap(prev => {
      const next = { ...prev };
      const s = new Set(next[memberId] ?? []);
      if (s.has(month)) s.delete(month); else s.add(month);
      next[memberId] = s;
      return next;
    });
  };

  const paidCountForMonth = (month: number) =>
    DUMMY_MEMBERS.filter(m => paidMap[m.id]?.has(month)).length;

  const totalForMonth = (month: number) => paidCountForMonth(month) * IURAN;

  const totalYTD = Array.from({ length: currentMonth }, (_, i) => totalForMonth(i + 1))
    .reduce((a, b) => a + b, 0);

  const handleSync = (month: number) => {
    const total = totalForMonth(month);
    const count = paidCountForMonth(month);
    if (total === 0) { alert('Belum ada anggota yang bayar di bulan ini.'); return; }
    if (confirm(`Sync kas ${MONTHS[month - 1]} ${activeYear}:\n${formatRp(total)} dari ${count} anggota\n\nData ini akan dicatat sebagai Pemasukan di Buku Kas Utama.`)) {
      setSyncedMonths(prev => new Set([...prev, month]));
    }
  };

  return (
    <div className="space-y-5">
      {/* Info bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-slate-500">
          Iuran <span className="font-semibold text-slate-700">Rp 5.000</span>/orang/bulan
          &ensp;·&ensp;Total terkumpul:&ensp;
          <span className="font-bold text-slate-800">{formatRp(totalYTD)}</span>
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Tahun:</span>
          <select
            value={activeYear}
            onChange={e => setActiveYear(Number(e.target.value))}
            className="border-none bg-slate-100 rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50">
                {/* Sticky name col */}
                <th className="px-5 py-3 text-left font-bold text-slate-600 text-[11px] uppercase tracking-wide sticky left-0 bg-slate-50 z-10 min-w-[200px] border-r border-slate-200">
                  Nama / NIM
                </th>
                {MONTHS.map((m, idx) => {
                  const month = idx + 1;
                  const isFuture = month > currentMonth;
                  const isSynced = syncedMonths.has(month);
                  const count = paidCountForMonth(month);
                  const total = totalForMonth(month);
                  return (
                    <th key={m} className={`px-1 py-2 text-center min-w-[72px] border-r border-slate-100 last:border-r-0 ${isFuture ? 'opacity-35' : ''}`}>
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-bold text-slate-600 text-[11px] uppercase tracking-wide">{m}</span>
                        {!isFuture && (
                          <>
                            <span className="text-[9px] text-slate-400 leading-none">{count}/{DUMMY_MEMBERS.length}</span>
                            {isSynced ? (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                <span className="material-symbols-outlined" style={{fontSize:'9px'}}>lock</span>
                                Synced
                              </span>
                            ) : total > 0 ? (
                              <button
                                onClick={() => handleSync(month)}
                                title={`Sync ${formatRp(total)} ke Buku Kas`}
                                className="text-[9px] font-bold text-primary bg-primary/10 hover:bg-primary/20 px-1.5 py-0.5 rounded-full transition-colors whitespace-nowrap cursor-pointer leading-tight"
                              >
                                Sync →
                              </button>
                            ) : null}
                          </>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {DUMMY_MEMBERS.map((member, ri) => (
                <tr key={member.id} className={`hover:bg-blue-50/30 transition-colors ${ri % 2 === 1 ? 'bg-slate-50/30' : ''}`}>
                  <td className="px-5 py-2.5 sticky left-0 z-10 border-r border-slate-200 bg-white">
                    <div className="font-semibold text-slate-800 text-[13px] leading-tight">{member.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5 tracking-wide">{member.nim}</div>
                  </td>
                  {MONTHS.map((_, idx) => {
                    const month = idx + 1;
                    const isFuture = month > currentMonth;
                    const isPaid = paidMap[member.id]?.has(month) ?? false;
                    return (
                      <td key={month} className="px-1 py-2.5 text-center border-r border-slate-100 last:border-r-0">
                        {isFuture ? (
                          <span className="inline-block w-9 h-6 rounded bg-slate-100/40" />
                        ) : (
                          <button
                            onClick={() => toggle(member.id, month)}
                            title={isPaid ? 'Lunas — klik untuk batalkan' : 'Belum — klik untuk tandai lunas'}
                            className={`inline-flex items-center justify-center w-9 h-6 rounded text-xs font-bold transition-all cursor-pointer select-none ${
                              isPaid
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            }`}
                          >
                            {isPaid ? '✓' : '—'}
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50/80">
                <td className="px-5 py-2.5 text-[11px] font-bold text-slate-500 uppercase sticky left-0 bg-slate-50 border-r border-slate-200 z-10">
                  Total Terkumpul
                </td>
                {MONTHS.map((_, idx) => {
                  const month = idx + 1;
                  const isFuture = month > currentMonth;
                  const total = totalForMonth(month);
                  return (
                    <td key={month} className={`px-1 py-2.5 text-center text-[11px] font-semibold border-r border-slate-100 last:border-r-0 ${
                      isFuture ? 'text-slate-300' : total > 0 ? 'text-slate-700' : 'text-slate-400'
                    }`}>
                      {isFuture ? '—' : total > 0 ? formatRp(total) : 'Rp 0'}
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          </table>
        </div>
        {/* Legend */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-5 h-4 rounded bg-green-100" />
            Lunas
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-5 h-4 rounded bg-slate-100" />
            Belum bayar
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-5 h-4 rounded bg-slate-100/40" />
            Bulan mendatang
          </span>
          <span className="ml-auto">Klik sel untuk toggle · Tombol Sync → mencatat ke Buku Kas Utama</span>
        </div>
      </div>
    </div>
  );
}
