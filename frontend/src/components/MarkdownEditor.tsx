import { useRef, useState } from "react";
import { useAuth } from "@/lib/auth";

const API = "/api";

export type MarkdownEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
  disabled?: boolean;
  onError?: (message: string) => void;
  className?: string;
  hideFooter?: boolean;
};

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = "Tulis dengan Markdown...",
  minRows = 8,
  disabled = false,
  onError,
  className = "",
  hideFooter = false,
}: MarkdownEditorProps) {
  const { token } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const insertAtCursor = (before: string, after: string = "") => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const text = value;
    const selected = text.slice(start, end);
    const newText = text.slice(0, start) + before + selected + after + text.slice(end);
    onChange(newText);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const insertImageByUrl = () => {
    const url = prompt("URL gambar:");
    if (!url?.trim()) return;
    const alt = prompt("Deskripsi gambar (opsional):") ?? "Gambar";
    insertAtCursor(`\n![${alt}](${url.trim()})\n`, "");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !token) {
      if (!token && file) onError?.("Anda harus login untuk mengunggah gambar.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      onError?.("Pilih file gambar (JPEG, PNG, GIF, atau WebP).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      onError?.("Ukuran file maksimal 10MB.");
      return;
    }
    onError?.("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const r = await fetch(`${API}/uploads`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        throw new Error((data as { message?: string }).message ?? "Gagal mengunggah");
      }
      const data = await r.json();
      const url = typeof (data as { url?: string }).url === "string" ? (data as { url: string }).url : "";
      if (url) insertAtCursor(`\n![${file.name}](${url})\n`, "");
    } catch (err) {
      onError?.(err instanceof Error ? err.message : "Gagal mengunggah gambar");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`flex flex-col border border-slate-200 rounded-xl bg-white overflow-hidden min-h-[200px] ${className}`}>
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-100 bg-slate-50">
        <button
          type="button"
          onClick={() => insertAtCursor("**", "**")}
          className="p-2 hover:bg-white rounded transition-colors text-slate-600 disabled:opacity-50"
          title="Bold"
          disabled={disabled}
        >
          <span className="material-symbols-outlined text-[20px]">format_bold</span>
        </button>
        <button
          type="button"
          onClick={() => insertAtCursor("_", "_")}
          className="p-2 hover:bg-white rounded transition-colors text-slate-600 disabled:opacity-50"
          title="Italic"
          disabled={disabled}
        >
          <span className="material-symbols-outlined text-[20px]">format_italic</span>
        </button>
        <button
          type="button"
          onClick={() => insertAtCursor("\n- ", "")}
          className="p-2 hover:bg-white rounded transition-colors text-slate-600 disabled:opacity-50"
          title="Bullet list"
          disabled={disabled}
        >
          <span className="material-symbols-outlined text-[20px]">format_list_bulleted</span>
        </button>
        <button
          type="button"
          onClick={() => insertAtCursor("\n1. ", "")}
          className="p-2 hover:bg-white rounded transition-colors text-slate-600 disabled:opacity-50"
          title="Numbered list"
          disabled={disabled}
        >
          <span className="material-symbols-outlined text-[20px]">format_list_numbered</span>
        </button>
        <div className="w-px h-6 bg-slate-200 mx-1" />
        <button
          type="button"
          onClick={() => {
            const u = prompt("URL:");
            if (u) insertAtCursor(`[`, `](${u})`);
          }}
          className="p-2 hover:bg-white rounded transition-colors text-slate-600 disabled:opacity-50"
          title="Link"
          disabled={disabled}
        >
          <span className="material-symbols-outlined text-[20px]">link</span>
        </button>
        <span className="inline-flex items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={handleImageUpload}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || uploading}
            className="p-2 hover:bg-white rounded transition-colors text-slate-600 disabled:opacity-50"
            title="Upload gambar"
          >
            <span className="material-symbols-outlined text-[20px]">image</span>
          </button>
          <button
            type="button"
            onClick={insertImageByUrl}
            disabled={disabled}
            className="px-1.5 py-1 text-[11px] text-slate-500 hover:text-primary hover:bg-white rounded disabled:opacity-50"
            title="Pakai URL gambar"
          >
            URL
          </button>
        </span>
        <button
          type="button"
          onClick={() => insertAtCursor("\n> ", "")}
          className="p-2 hover:bg-white rounded transition-colors text-slate-600 disabled:opacity-50"
          title="Quote"
          disabled={disabled}
        >
          <span className="material-symbols-outlined text-[20px]">format_quote</span>
        </button>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={minRows}
        disabled={disabled}
        className="flex-1 p-6 min-h-[140px] resize-y border-none bg-transparent text-slate-800 leading-relaxed text-base placeholder:text-slate-400 focus:ring-0 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500"
        spellCheck
      />
      {!hideFooter && (
        <div className="p-3 border-t border-slate-100 text-xs text-slate-400">
          Markdown editor — gunakan tombol gambar untuk menyisipkan gambar.
        </div>
      )}
    </div>
  );
}
