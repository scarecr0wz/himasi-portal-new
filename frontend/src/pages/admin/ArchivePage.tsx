import { useState, useEffect } from "react";

type ArchiveDocument = {
  id: string;
  docType: string;
  noSurat: string | null;
  fromTo: string | null;
  subject: string;
  letterDate: string | null;
  description: string | null;
  attachmentPath: string | null;
  createdAt: string;
  user: { name: string };
};

export default function ArchivePage() {
  const [activeTab, setActiveTab] = useState<"SURAT_MASUK" | "SURAT_KELUAR" | "DOKUMEN">("SURAT_MASUK");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [documents, setDocuments] = useState<ArchiveDocument[]>([]);

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`/api/admin/archive?docType=${activeTab}`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("himasi_portal_token")}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [activeTab]);

  return (
    <div className="p-6 md:p-8 space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 mb-2">Persuratan & Dokumen</h1>
          <p className="text-slate-500">Kelola pendataan surat masuk, keluar, dan berkas penting organisasi.</p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            style={{ padding: "0.5rem 1rem", background: "var(--accent)", color: "white", borderRadius: "8px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "0.25rem", whiteSpace: "nowrap" }}
          >
            + Tambah Data
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200">
        {[
          { id: "SURAT_MASUK", label: "Surat Masuk", icon: "move_to_inbox" },
          { id: "SURAT_KELUAR", label: "Surat Keluar", icon: "unarchive" },
          { id: "DOKUMEN", label: "Dokumen Lainnya", icon: "description" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Cloud-like grid view */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden min-h-[400px]">
        {documents && documents.length > 0 ? (
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 uppercase text-[11px] font-bold tracking-wider">
                  <tr>
                    <th className="px-4 py-3 w-10 text-center">#</th>
                    <th className="px-4 py-3">Perihal / Judul</th>
                    {activeTab !== "DOKUMEN" && <th className="px-4 py-3">No. Surat</th>}
                    {activeTab !== "DOKUMEN" && <th className="px-4 py-3">{activeTab === "SURAT_MASUK" ? "Pengirim" : "Tujuan"}</th>}
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr 
                      key={doc.id} 
                      onClick={() => doc.attachmentPath && window.open(doc.attachmentPath, '_blank')}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-3 text-center">
                        <span className={`material-symbols-outlined align-middle text-[20px] ${doc.attachmentPath?.endsWith('.pdf') ? 'text-red-500' : doc.attachmentPath ? 'text-blue-500' : 'text-slate-400'}`}>
                          {doc.attachmentPath?.endsWith('.pdf') ? 'picture_as_pdf' : doc.attachmentPath ? 'image' : 'draft'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{doc.subject}</div>
                        <div className="text-xs text-slate-500 line-clamp-1">{doc.description || "Tidak ada keterangan"}</div>
                      </td>
                      {activeTab !== "DOKUMEN" && <td className="px-4 py-3 font-mono text-xs text-slate-500">{doc.noSurat || "-"}</td>}
                      {activeTab !== "DOKUMEN" && <td className="px-4 py-3 text-slate-700">{doc.fromTo || "-"}</td>}
                      <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                        {doc.letterDate ? new Date(doc.letterDate).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' }) : "-"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {doc.attachmentPath && (
                            <button type="button" className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-md transition-colors" title="Buka File" onClick={(e) => { e.stopPropagation(); window.open(doc.attachmentPath!, '_blank'); }}>
                              <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                            </button>
                          )}
                          <button 
                            type="button"
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (confirm("Hapus dokumen ini?")) {
                                await fetch(`/api/admin/archive/${doc.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('himasi_portal_token')}` } });
                                fetchDocuments();
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Hapus"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-slate-400">
              <span className="material-symbols-outlined text-5xl mb-2 opacity-50">folder_open</span>
              <p>Tidak ada data di folder ini</p>
            </div>
          )}
        </div>

      {isModalOpen && (
        <ArchiveModal 
          activeTab={activeTab} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => {
            setIsModalOpen(false);
            fetchDocuments();
          }} 
        />
      )}
    </div>
  );
}

function ArchiveModal({ activeTab, onClose, onSuccess }: { activeTab: string, onClose: () => void, onSuccess: () => void }) {
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    
    try {
      const form = e.currentTarget;
      let attachmentPath = null;
      
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const uploadRes = await fetch("/api/admin/archive/upload", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('himasi_portal_token')}`
          },
          body: formData
        });
        if (!uploadRes.ok) throw new Error("Gagal mengunggah file");
        const uploadData = await uploadRes.json();
        attachmentPath = uploadData.url;
      }
      
      const pengirim = (form.elements.namedItem("pengirim") as HTMLInputElement)?.value || "";
      const tujuan = (form.elements.namedItem("tujuan") as HTMLInputElement)?.value || "";
      
      let fromToCombined = null;
      if (pengirim && tujuan) fromToCombined = `${pengirim} -> ${tujuan}`;
      else if (pengirim) fromToCombined = pengirim;
      else if (tujuan) fromToCombined = tujuan;

      const letterDateVal = (form.elements.namedItem("letterDate") as HTMLInputElement)?.value;
      const letterDate = letterDateVal ? new Date(letterDateVal).toISOString() : null;

      const payload = {
        docType: activeTab,
        subject: (form.elements.namedItem("subject") as HTMLInputElement).value,
        noSurat: (form.elements.namedItem("noSurat") as HTMLInputElement)?.value || null,
        fromTo: fromToCombined,
        letterDate: letterDate,
        description: (form.elements.namedItem("description") as HTMLTextAreaElement).value,
        attachmentPath
      };
      
      const res = await fetch("/api/admin/archive", {
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
        const errMsg = errData?.message || errData?.error?.issues?.[0]?.message || await res.text();
        alert("Gagal menyimpan data: " + errMsg);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg relative z-10 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-xl font-bold">
            {activeTab === "SURAT_MASUK" ? "Tambah Surat Masuk" : activeTab === "SURAT_KELUAR" ? "Tambah Surat Keluar" : "Upload Dokumen"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 rounded-lg p-1">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <form id="archiveForm" onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col">
          <div className="p-5 space-y-5 flex-1">
            <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Perihal / Judul Dokumen <span className="text-red-500">*</span></label>
            <input type="text" name="subject" required className="w-full border-0 rounded-none px-4 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/50 outline-none transition-all" placeholder="Masukkan perihal..." />
          </div>
          
          {activeTab !== "DOKUMEN" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Nomor Surat (Manual)</label>
              <input type="text" name="noSurat" className="w-full border-0 rounded-none px-4 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/50 outline-none transition-all" placeholder="Misal: 001/HM.UTB/VIII/2026" />
            </div>
          )}
          
          {activeTab !== "DOKUMEN" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">Pengirim (Dari)</label>
                <input type="text" name="pengirim" className="w-full border-0 rounded-none px-4 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/50 outline-none transition-all" placeholder="Nama instansi/orang pengirim" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700">Kepada / Tujuan</label>
                <input type="text" name="tujuan" className="w-full border-0 rounded-none px-4 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/50 outline-none transition-all" placeholder="Ditujukan kepada" />
              </div>
            </div>
          )}
          
          {activeTab !== "DOKUMEN" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Tanggal</label>
              <input type="date" name="letterDate" className="w-full border-0 rounded-none px-4 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/50 outline-none transition-all" />
            </div>
          )}
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Keterangan Tambahan</label>
            <textarea name="description" rows={3} className="w-full border-0 rounded-none px-4 py-2.5 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/50 outline-none transition-all resize-none" placeholder="Opsional..."></textarea>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Lampiran File</label>
            <div 
              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center relative transition-colors ${dragOver ? 'border-primary bg-primary/5' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  setSelectedFile(e.dataTransfer.files[0]);
                }
              }}
            >
              {selectedFile ? (
                <>
                  <span className="material-symbols-outlined text-4xl text-primary mb-2">task</span>
                  <p className="text-sm font-medium text-slate-800">{selectedFile.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedFile(null); }} className="mt-3 text-xs text-red-500 hover:text-red-700 font-medium">Hapus File</button>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">upload_file</span>
                  <p className="text-sm font-medium text-slate-700">Klik atau drag & drop file di sini (PDF, Image)</p>
                  <p className="text-xs text-slate-500 mt-1">Maks. 10MB</p>
                  <input type="file" name="file" accept=".pdf,image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }} />
                </>
              )}
            </div>
          </div>
          </div>
          
          <div className="p-5 border-t bg-slate-50 rounded-b-2xl flex justify-end gap-3 mt-auto shrink-0">
            <button type="button" onClick={onClose} className="portal-btn portal-btn-secondary" disabled={saving}>Batal</button>
            <button type="submit" className="portal-btn portal-btn-primary flex items-center gap-2" disabled={saving}>
              {saving ? <span className="material-symbols-outlined animate-spin">refresh</span> : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
