import { Link } from "react-router-dom";

export default function PublicFooter() {
    return (
        <footer id="footer" className="bg-white border-t border-slate-200 px-6 md:px-10 lg:px-40 py-16">
            <div className="max-w-[1280px] mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-2">
                            <img src="/logo-himasi.png" alt="HIMASI" className="h-8 w-auto object-contain" />
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Wadah mahasiswa Prodi Sistem Informasi Universitas Terbuka Bogor. Informasi, acara, dan layanan kemahasiswaan dalam satu portal.
                        </p>
                        <div className="flex gap-4">
                            <a className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-all" href="#" aria-label="Web">
                                <span className="material-symbols-outlined text-lg">public</span>
                            </a>
                            <a className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-primary hover:text-white transition-all" href="#" aria-label="Email">
                                <span className="material-symbols-outlined text-lg">alternate_email</span>
                            </a>
                        </div>
                    </div>
                    <div className="flex flex-col gap-6">
                        <h4 className="text-slate-900 font-bold uppercase text-xs tracking-widest">Sumber</h4>
                        <ul className="flex flex-col gap-3 text-sm text-slate-500">
                            <li><a href="/#berita" className="hover:text-primary transition-colors">Berita</a></li>
                            <li><a href="/#acara" className="hover:text-primary transition-colors">Acara</a></li>
                            <li><Link to="/pengurus" className="hover:text-primary transition-colors">Pengurus</Link></li>
                            <li><a href="/#program-kerja" className="hover:text-primary transition-colors">Program Kerja</a></li>
                            <li><a href="/#department" className="hover:text-primary transition-colors">Department</a></li>
                            <li><a href="/#faq" className="hover:text-primary transition-colors">FAQ</a></li>
                            <li><Link to="/login" className="hover:text-primary transition-colors">Portal Mahasiswa</Link></li>
                        </ul>
                    </div>
                    <div className="flex flex-col gap-6">
                        <h4 className="text-slate-900 font-bold uppercase text-xs tracking-widest">Institusi</h4>
                        <ul className="flex flex-col gap-3 text-sm text-slate-500">
                            <li><a href="/#tentang" className="hover:text-primary transition-colors">Tentang Kami</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Kontak</a></li>
                        </ul>
                    </div>
                    <div className="flex flex-col gap-6">
                        <h4 className="text-slate-900 font-bold uppercase text-xs tracking-widest">Tetap Terkini</h4>
                        <p className="text-sm text-slate-500">Berlangganan untuk info terbaru dari HIMASI.</p>
                        <div className="flex gap-2">
                            <input className="w-full bg-slate-100 border-none rounded-lg text-sm px-4 py-2 focus:ring-2 focus:ring-primary" placeholder="Alamat email" type="email" />
                            <button type="button" className="bg-primary text-white p-2 rounded-lg hover:bg-primary/90 transition-all">
                                <span className="material-symbols-outlined text-xl">send</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-slate-400 text-[10px] font-medium tracking-wide">© 2024 HIMASI Universitas Terbuka Bogor. Dikelola oleh Departemen Media & Publikasi.</p>
                    <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        <a href="#" className="hover:text-primary">Kebijakan Privasi</a>
                        <a href="#" className="hover:text-primary">Syarat Layanan</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
