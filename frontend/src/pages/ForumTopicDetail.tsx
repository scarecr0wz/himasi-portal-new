import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { avatarUrl } from "@/lib/auth";

const API = "/api";

type Author = { id: string; name: string; nim: string; avatar?: string | null };

type Reply = {
  id: string;
  content: string;
  createdAt: string;
  author: Author;
};

type TopicDetail = {
  id: string;
  title: string;
  content: string;
  imagePath: string | null;
  isPinned: boolean;
  categoryId: string;
  categoryName: string;
  createdAt: string;
  updatedAt: string;
  author: Author;
  replies: Reply[];
};

function formatDate(d: string): string {
  try {
    return new Date(d).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function AuthorBlock({ author }: { author: Author }) {
  const url = avatarUrl(author.avatar);
  return (
    <div className="flex items-center gap-3">
      {url ? (
        <img src={url} alt="" className="w-10 h-10 rounded-full object-cover bg-slate-100" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
          {author.name.charAt(0).toUpperCase()}
        </div>
      )}
      <div>
        <p className="font-medium text-slate-800 text-sm">{author.name}</p>
        <p className="text-slate-500 text-xs">NIM {author.nim}</p>
      </div>
    </div>
  );
}

export default function ForumTopicDetail() {
  const { topicId } = useParams<{ topicId: string }>();
  const { token } = useAuth();
  const [topic, setTopic] = useState<TopicDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !topicId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`${API}/forum/topics/${topicId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        if (!r.ok) throw new Error("Topik tidak ditemukan");
        return r.json();
      })
      .then(setTopic)
      .catch(() => setError("Topik tidak ditemukan"))
      .finally(() => setLoading(false));
  }, [token, topicId]);

  function handleSubmitReply(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !topicId || !replyContent.trim()) return;
    setReplySubmitting(true);
    setReplyError(null);
    fetch(`${API}/forum/topics/${topicId}/replies`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: replyContent.trim() }),
    })
      .then((r) => {
        if (!r.ok) return r.json().then((d) => { throw new Error(d.message || "Gagal mengirim balasan"); });
        return r.json();
      })
      .then((newReply) => {
        setTopic((prev) =>
          prev
            ? {
                ...prev,
                replies: [
                  ...prev.replies,
                  {
                    id: newReply.id,
                    content: newReply.content,
                    createdAt: newReply.createdAt,
                    author: newReply.author,
                  },
                ],
              }
            : null
        );
        setReplyContent("");
      })
      .catch((err) => setReplyError(err instanceof Error ? err.message : "Gagal mengirim balasan"))
      .finally(() => setReplySubmitting(false));
  }

  if (loading) {
    return (
      <div className="min-w-0 w-full py-12 text-center text-slate-500">
        Memuat topik...
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="min-w-0 w-full py-12 text-center">
        <p className="text-slate-600 mb-4">{error ?? "Topik tidak ditemukan"}</p>
        <Link to="/dashboard/forum" className="text-primary font-semibold hover:underline">
          ← Kembali ke Ruang Terbuka
        </Link>
      </div>
    );
  }

  return (
    <div className="min-w-0 w-full">
      <nav className="dashboard-breadcrumb" aria-label="Breadcrumb">
        <Link to="/dashboard">Dashboard</Link>
        <span> &gt; </span>
        <Link to="/dashboard/forum">Ruang Terbuka</Link>
        <span> &gt; {topic.title}</span>
      </nav>

      <article className="dashboard-section">
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          {topic.isPinned && (
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold uppercase">
              Pin
            </span>
          )}
          <span className="text-slate-400 text-sm">{topic.categoryName}</span>
        </div>

        <h1 className="text-xl md:text-2xl font-bold text-slate-800 mb-4 leading-tight">
          {topic.title}
        </h1>

        <div className="flex items-center gap-4 text-slate-500 text-sm mb-6 pb-6 border-b border-slate-200">
          <AuthorBlock author={topic.author} />
          <span>{formatDate(topic.updatedAt)}</span>
        </div>

        <div className="prose prose-slate max-w-none text-slate-700 whitespace-pre-wrap">
          {topic.content}
        </div>

        {topic.replies.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-bold text-slate-800 mb-4">
              {topic.replies.length} Balasan
            </h2>
            <ul className="space-y-6">
              {topic.replies.map((r) => (
                <li
                  key={r.id}
                  className="pl-4 border-l-2 border-slate-200 py-2"
                >
                  <div className="flex items-start gap-3 mb-2">
                    <AuthorBlock author={r.author} />
                    <span className="text-slate-400 text-xs shrink-0">
                      {formatDate(r.createdAt)}
                    </span>
                  </div>
                  <p className="text-slate-700 text-sm whitespace-pre-wrap">{r.content}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-10 pt-6 border-t border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Tulis balasan</h2>
          <form onSubmit={handleSubmitReply} className="space-y-4">
            {replyError && <p className="text-red-600 text-sm">{replyError}</p>}
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Tulis balasan..."
              rows={4}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-400 resize-y"
              required
            />
            <button
              type="submit"
              disabled={replySubmitting || !replyContent.trim()}
              className="px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:opacity-90 disabled:opacity-50"
            >
              {replySubmitting ? "Mengirim..." : "Kirim balasan"}
            </button>
          </form>
        </div>
      </article>
    </div>
  );
}
