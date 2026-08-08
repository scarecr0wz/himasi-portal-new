import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";

/* ─── Placeholder photo URL (ganti dengan foto asli jika sudah ada) ───
   Foto: kampus universitas, landscape orientation
   Source: Unsplash free-to-use                                         */
const COVER_PHOTO =
  "/himasi-login-page.JPG";

export default function Login() {
  const [nim, setNim] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(nim.trim(), password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login gagal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        /* ─── Root ─── */
        .login-root {
          min-height: 100vh;
          display: flex;
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
          background: #f1f5f9;
        }

        /* ═══════════════════════════════════════
           LEFT PANEL — full photo + overlay
        ═══════════════════════════════════════ */
        .login-brand {
          display: none;
          width: 50%;
          position: relative;
          overflow: hidden;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        @media (min-width: 1024px) {
          .login-brand { display: flex; }
        }

        /* Background photo */
        .login-brand-photo {
          position: absolute;
          inset: 0;
          background-image: url('${COVER_PHOTO}');
          background-size: cover;
          background-position: center center;
          background-repeat: no-repeat;
        }

        /* Dark gradient overlay on top of photo */
        .login-brand-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            160deg,
            rgba(8, 18, 40, 0.82) 0%,
            rgba(10, 22, 50, 0.75) 40%,
            rgba(12, 30, 80, 0.80) 100%
          );
        }

        /* Subtle vignette at edges */
        .login-brand-vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.35) 100%);
        }

        /* Blue tint shimmer at bottom */
        .login-brand-shimmer {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 200px;
          background: linear-gradient(to top, rgba(19, 127, 236, 0.18), transparent);
        }

        /* ── Brand content (above overlay) ── */
        .login-brand-content {
          position: relative;
          z-index: 10;
          text-align: center;
          padding: 0 3rem;
          max-width: 440px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
        }

        /* ── LOGO — highlighted ── */
        .login-logo-wrap {
          position: relative;
          width: 180px;
          height: 180px;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Outer glow pulse ring */
        .login-logo-glow {
          position: absolute;
          inset: -28px;
          border-radius: 58px;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.35), transparent 70%);
          animation: logoPulse 3s ease-in-out infinite;
        }
        @keyframes logoPulse {
          0%, 100% { opacity: 0.6; transform: scale(0.95); }
          50% { opacity: 1; transform: scale(1.05); }
        }

        /* Spinning dashed border ring */
        .login-logo-ring {
          position: absolute;
          inset: -14px;
          border-radius: 46px;
          border: 2px dashed rgba(255, 255, 255, 0.5);
          animation: rotateSlow 12s linear infinite;
        }
        @keyframes rotateSlow { to { transform: rotate(360deg); } }

        /* Solid gradient ring */
        .login-logo-border {
          position: absolute;
          inset: -3px;
          border-radius: 36px;
          background: linear-gradient(135deg, #ffffffff, #ffffffff, #ffffffff);
          background-size: 200% 200%;
          animation: gradientShift 4s ease-in-out infinite;
          opacity: 0.9;
        }
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* Logo box itself */
        .login-logo-box {
          position: relative;
          z-index: 1;
          width: 180px;
          height: 180px;
          border-radius: 34px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(59,154,254,0.15));
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow:
            0 0 80px rgba(19, 127, 236, 0.5),
            0 24px 64px rgba(0,0,0,0.45),
            inset 0 1px 0 rgba(255,255,255,0.18),
            inset 0 -1px 0 rgba(0,0,0,0.15);
        }

        /* Shine glare inside logo box */
        .login-logo-box::after {
          content: '';
          position: absolute;
          top: 6px; left: 6px; right: 30%;
          height: 30%;
          background: linear-gradient(135deg, rgba(255,255,255,0.22), transparent);
          border-radius: 12px 12px 40% 40%;
          pointer-events: none;
        }

        .login-logo-img {
          width: 120px;
          height: 120px;
          object-fit: contain;
          position: relative;
          z-index: 1;
        }

        /* ── Brand text ── */
        .login-brand-title {
          font-size: 2.8rem;
          font-weight: 800;
          color: #fff;
          line-height: 1.1;
          margin: 0 0 0.75rem;
          letter-spacing: -0.03em;
          text-shadow: 0 2px 20px rgba(0,0,0,0.5);
        }
        .login-brand-title span {
          background: linear-gradient(135deg, #3b9afe, #137fec);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 0 12px rgba(59,154,254,0.5));
        }

        .login-brand-subtitle {
          color: rgba(203, 213, 225, 0.9);
          font-size: 0.95rem;
          line-height: 1.75;
          margin: 0 0 2.25rem;
          text-shadow: 0 1px 8px rgba(0,0,0,0.4);
        }

        /* ── Feature cards ── */
        .login-brand-features {
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
          width: 100%;
          text-align: left;
        }

        .login-feature-card {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          padding: 0.75rem 1rem;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.10);
          border-radius: 12px;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          transition: background 0.2s, border-color 0.2s, transform 0.2s;
          cursor: default;
        }
        .login-feature-card:hover {
          background: rgba(255,255,255,0.10);
          border-color: rgba(59, 154, 254, 0.35);
          transform: translateX(4px);
        }

        .login-feature-icon {
          width: 34px; height: 34px;
          border-radius: 8px;
          background: linear-gradient(135deg, rgba(19,127,236,0.25), rgba(59,154,254,0.2));
          border: 1px solid rgba(59,154,254,0.3);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.95rem;
          flex-shrink: 0;
        }

        .login-feature-text {
          color: rgba(203, 213, 225, 0.95);
          font-size: 0.85rem;
          font-weight: 500;
          line-height: 1.4;
        }

        /* Brand footer */
        .login-brand-footer {
          position: absolute;
          bottom: 1.25rem;
          color: rgba(100, 116, 139, 0.8);
          font-size: 0.72rem;
          letter-spacing: 0.04em;
          z-index: 10;
        }

        /* Photo credit tag */
        .login-photo-credit {
          position: absolute;
          top: 1rem; right: 1rem;
          z-index: 10;
          padding: 0.3rem 0.65rem;
          background: rgba(0,0,0,0.35);
          border-radius: 6px;
          font-size: 0.65rem;
          color: rgba(255,255,255,0.5);
          backdrop-filter: blur(4px);
        }

        /* ═══════════════════════════════════════
           RIGHT PANEL — form
        ═══════════════════════════════════════ */
        .login-form-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem 1.5rem;
          background: #f1f5f9;
          position: relative;
          overflow: hidden;
        }

        /* Subtle blue radial glow bg (desktop only) */
        @media (min-width: 1024px) {
          .login-form-panel::before {
            content: '';
            position: absolute;
            width: 500px; height: 500px;
            top: -150px; right: -150px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(19,127,236,0.06), transparent 70%);
            pointer-events: none;
          }
          .login-form-panel::after {
            content: '';
            position: absolute;
            width: 400px; height: 400px;
            bottom: -100px; left: -100px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(59,154,254,0.04), transparent 70%);
            pointer-events: none;
          }
        }

        /* ─── Mobile hero ─── */
        .login-mobile-hero {
          display: none;
        }
        @media (max-width: 1023px) {
          /* Stretch form panel to fill full screen */
          .login-form-panel {
            justify-content: flex-start;
            padding: 0;
            background: #f1f5f9;
          }

          /* Hero photo strip at top */
          .login-mobile-hero {
            display: block;
            position: relative;
            width: 100%;
            height: 260px;
            overflow: hidden;
            flex-shrink: 0;
          }

          .login-mobile-hero-photo {
            position: absolute;
            inset: 0;
            background-image: url('${COVER_PHOTO}');
            background-size: cover;
            background-position: center center;
            background-repeat: no-repeat;
          }

          /* Dark gradient overlay */
          .login-mobile-hero-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(
              160deg,
              rgba(8,18,40,0.72) 0%,
              rgba(10,22,55,0.65) 50%,
              rgba(12,30,90,0.70) 100%
            );
          }

          /* Fade to page bg at bottom */
          .login-mobile-hero-fade {
            position: absolute;
            bottom: 0; left: 0; right: 0;
            height: 100px;
            background: linear-gradient(to bottom, transparent, #f1f5f9);
          }

          /* Hero content */
          .login-mobile-hero-content {
            position: relative;
            z-index: 10;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 1.5rem 1.5rem 2.5rem;
            gap: 0.75rem;
          }

          /* Mobile logo inside hero */
          .login-mobile-logo-box {
            position: relative;
            width: 84px; height: 84px;
            border-radius: 22px;
            background: #ffffff;
            border: 1.5px solid rgba(255, 255, 255, 0.9);
            display: flex; align-items: center; justify-content: center;
            box-shadow:
              0 0 40px rgba(19, 127, 236, 0.40),
              0 8px 28px rgba(0,0,0,0.40),
              inset 0 1px 0 rgba(255,255,255,1);
          }
          .login-mobile-logo-box::before {
            content: '';
            position: absolute;
            inset: -6px;
            border-radius: 28px;
            border: 1.5px dashed rgba(255,255,255,0.35);
            animation: rotateSlow 14s linear infinite;
          }
          .login-mobile-logo-img {
            width: 56px; height: 56px;
            object-fit: contain;
            position: relative;
            z-index: 1;
          }

          .login-mobile-hero-title {
            font-size: 1.75rem;
            font-weight: 800;
            color: #fff;
            margin: 0;
            letter-spacing: -0.025em;
            text-shadow: 0 2px 12px rgba(0,0,0,0.4);
            text-align: center;
            line-height: 1.2;
          }
          .login-mobile-hero-title span {
            background: linear-gradient(135deg, #60c2ff, #3b9afe);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .login-mobile-hero-sub {
            font-size: 0.8rem;
            color: rgba(203,213,225,0.85);
            margin: 0;
            text-align: center;
            line-height: 1.6;
            text-shadow: 0 1px 6px rgba(0,0,0,0.3);
          }

          /* Card area below hero */
          .login-mobile-form-area {
            width: 100%;
            padding: 0 1.25rem 2rem;
            margin-top: -1.5rem;
            position: relative;
            z-index: 10;
          }

          /* Card slightly lifted */
          .login-card {
            box-shadow:
              0 -4px 0 0 rgba(19,127,236,0.08),
              0 0 0 1px rgba(15,23,42,0.04),
              0 8px 32px -8px rgba(15,23,42,0.15);
          }

          .login-back-link {
            margin-top: 1rem;
          }
        }

        /* ── Card ── */
        .login-card {
          width: 100%;
          max-width: 440px;
          background: #ffffff;
          border-radius: 24px;
          border: 1px solid #e2e8f0;
          box-shadow:
            0 0 0 1px rgba(15,23,42,0.03),
            0 4px 6px -1px rgba(15,23,42,0.05),
            0 20px 40px -12px rgba(15,23,42,0.10);
          padding: 2.5rem;
          position: relative;
          z-index: 1;
          opacity: 0;
          transform: translateY(16px);
          animation: cardEnter 0.45s 0.1s ease forwards;
        }
        @keyframes cardEnter {
          to { opacity: 1; transform: translateY(0); }
        }

        /* Top shine line — blue */
        .login-card::before {
          content: '';
          position: absolute;
          top: 0; left: 2.5rem; right: 2.5rem;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(19,127,236,0.4), transparent);
        }

        /* ── Card header ── */
        .login-card-header { margin-bottom: 2rem; }

        .login-card-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.3rem 0.75rem;
          background: rgba(19,127,236,0.08);
          border: 1px solid rgba(19,127,236,0.2);
          border-radius: 100px;
          font-size: 0.72rem;
          font-weight: 700;
          color: #137fec;
          margin-bottom: 1rem;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .login-card-badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #137fec;
          animation: dotPulse 2s ease-in-out infinite;
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }

        .login-card-title {
          font-size: 1.75rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 0.375rem;
          letter-spacing: -0.025em;
          line-height: 1.2;
        }
        .login-card-desc {
          font-size: 0.9rem;
          color: #64748b;
          margin: 0;
          line-height: 1.6;
        }

        /* ── Form fields ── */
        .login-form { display: flex; flex-direction: column; gap: 1.25rem; }
        .login-field { display: flex; flex-direction: column; gap: 0.5rem; }

        .login-label {
          font-size: 0.82rem;
          font-weight: 600;
          color: #374151;
          letter-spacing: 0.015em;
        }

        .login-input-wrap { position: relative; }

        .login-input-icon {
          position: absolute;
          left: 0.9rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
          display: flex;
          transition: color 0.2s;
        }

        .login-input {
          width: 100%;
          padding: 0.825rem 1rem 0.825rem 2.75rem;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          font-size: 0.9rem;
          font-family: inherit;
          color: #0f172a;
          background: #f8fafc;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          box-sizing: border-box;
          outline: none;
        }
        .login-input::placeholder { color: #94a3b8; }
        .login-input:hover:not(:focus) {
          border-color: #cbd5e1;
          background: #fff;
        }
        .login-input:focus {
          border-color: #137fec;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(19,127,236,0.10);
        }

        /* On focus, change icon colour */
        .login-input-wrap:focus-within .login-input-icon {
          color: #137fec;
        }

        .login-input-pw { padding-right: 3rem; }

        .login-pw-toggle {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #94a3b8;
          padding: 0.25rem;
          border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          transition: color 0.15s, background 0.15s;
        }
        .login-pw-toggle:hover {
          color: #137fec;
          background: rgba(19,127,236,0.08);
        }

        /* ── Error ── */
        .login-error {
          display: flex;
          align-items: flex-start;
          gap: 0.625rem;
          padding: 0.875rem 1rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 12px;
          font-size: 0.85rem;
          color: #dc2626;
          line-height: 1.5;
          animation: errorSlide 0.25s ease;
        }
        @keyframes errorSlide {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Submit button — BLUE ── */
        .login-submit {
          width: 100%;
          padding: 0.9rem 1.5rem;
          border: none;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 700;
          font-family: inherit;
          color: #ffffff;
          cursor: pointer;
          background: linear-gradient(135deg, #137fec 0%, #3b9afe 100%);
          box-shadow: 0 4px 14px -2px rgba(19,127,236,0.40);
          transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        /* Inner shine */
        .login-submit::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12), transparent 60%);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .login-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px -4px rgba(19,127,236,0.50);
        }
        .login-submit:hover:not(:disabled)::before { opacity: 1; }
        .login-submit:active:not(:disabled) {
          transform: translateY(0) scale(0.99);
          box-shadow: 0 4px 12px -4px rgba(19,127,236,0.35);
        }
        .login-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          background: linear-gradient(135deg, #64748b, #94a3b8);
          box-shadow: none;
        }

        /* Arrow animation */
        .login-arrow { display: flex; transition: transform 0.2s; }
        .login-submit:hover:not(:disabled) .login-arrow { transform: translateX(4px); }

        /* Spinner */
        .login-spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Trust indicators ── */
        .login-trust {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.25rem;
          margin-top: 1.25rem;
        }
        .login-trust-item {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.72rem;
          color: #94a3b8;
          font-weight: 500;
        }

        /* ── Mobile form wrapper (pass-through on desktop) ── */
        .login-mobile-form-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          padding: 2rem 1.5rem;
        }

        /* ── Back link ── */
        .login-back-link {
          text-align: center;
          margin-top: 1.5rem;
        }
        .login-back-link a {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #64748b;
          text-decoration: none;
          transition: color 0.2s;
        }
        .login-back-link a:hover { color: #137fec; }

        /* HIMA SI public theme alignment */
        .login-root {
          background:
            radial-gradient(circle at 88% 8%, rgba(22, 81, 164, 0.08), transparent 26rem),
            linear-gradient(180deg, #f8fbff 0%, #f1f5f9 100%);
        }

        .login-brand-overlay {
          background: linear-gradient(
            150deg,
            rgba(28, 57, 106, 0.95) 0%,
            rgba(28, 57, 106, 0.82) 48%,
            rgba(22, 81, 164, 0.76) 100%
          );
        }

        .login-brand-vignette {
          background: radial-gradient(ellipse at center, transparent 35%, rgba(8, 24, 50, 0.28) 100%);
        }

        .login-brand-shimmer {
          height: 240px;
          background: linear-gradient(to top, rgba(22, 81, 164, 0.25), transparent);
        }

        .login-logo-glow {
          display: none;
        }

        .login-logo-ring {
          display: none;
        }

        .login-logo-border {
          display: none;
        }

        .login-logo-wrap {
          width: 136px;
          height: 136px;
          margin-bottom: 1.75rem;
        }

        .login-logo-box {
          width: 136px;
          height: 136px;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.94);
          border-color: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          box-shadow:
            0 1rem 2.5rem rgba(8, 24, 50, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }

        .login-logo-box::after { display: none; }

        .login-logo-img {
          width: 92px;
          height: 92px;
        }

        .login-brand-title span,
        .login-mobile-hero-title span {
          background: linear-gradient(135deg, #dbeafe, #a9caff);
          -webkit-background-clip: text;
          background-clip: text;
          filter: none;
        }

        .login-brand-subtitle { color: rgba(226, 232, 240, 0.86); }
        .login-brand-footer { color: rgba(226, 232, 240, 0.58); }

        .login-form-panel {
          background:
            radial-gradient(circle at 88% 8%, rgba(22, 81, 164, 0.075), transparent 25rem),
            linear-gradient(180deg, #f8fbff, #f1f5f9);
        }

        .login-form-panel::before {
          background: radial-gradient(circle, rgba(22, 81, 164, 0.055), transparent 70%);
        }

        .login-form-panel::after {
          background: radial-gradient(circle, rgba(28, 57, 106, 0.04), transparent 70%);
        }

        .login-card {
          border-color: rgba(22, 81, 164, 0.13);
          border-radius: 22px;
          box-shadow:
            0 0 0 1px rgba(22, 81, 164, 0.025),
            0 1.5rem 4rem rgba(28, 57, 106, 0.1);
        }

        .login-card::before {
          background: linear-gradient(90deg, transparent, rgba(22, 81, 164, 0.4), transparent);
        }

        .login-card-title { color: #1c396a; }
        .login-label { color: #334766; }

        .login-input:focus {
          border-color: #1651a4;
          box-shadow: 0 0 0 4px rgba(22, 81, 164, 0.09);
        }

        .login-input-wrap:focus-within .login-input-icon,
        .login-pw-toggle:hover,
        .login-back-link a:hover { color: #1651a4; }

        .login-pw-toggle:hover { background: rgba(22, 81, 164, 0.08); }

        .login-submit {
          background: linear-gradient(135deg, #1651a4 0%, #1c396a 100%);
          box-shadow: 0 0.55rem 1.4rem rgba(28, 57, 106, 0.25);
        }

        .login-submit:hover:not(:disabled) {
          box-shadow: 0 0.85rem 2rem rgba(28, 57, 106, 0.32);
        }

        .login-submit:active:not(:disabled) {
          box-shadow: 0 0.35rem 1rem rgba(28, 57, 106, 0.24);
        }

        .login-trust-item svg { stroke: #1651a4; }

        @media (max-width: 1023px) {
          .login-form-panel { background: #f8fafc; }
          .login-mobile-hero-overlay {
            background: linear-gradient(155deg, rgba(28, 57, 106, 0.92), rgba(22, 81, 164, 0.72));
          }
          .login-mobile-hero-fade { background: linear-gradient(to bottom, transparent, #f8fafc); }
          .login-mobile-logo-box {
            border-radius: 18px;
            box-shadow: 0 0.6rem 1.8rem rgba(8, 24, 50, 0.24);
          }
          .login-mobile-logo-box::before { display: none; }
          .login-card {
            box-shadow:
              0 -4px 0 rgba(22, 81, 164, 0.06),
              0 0 0 1px rgba(22, 81, 164, 0.04),
              0 1rem 2.5rem rgba(28, 57, 106, 0.11);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .login-logo-glow,
          .login-card,
          .login-card-badge-dot,
          .login-spinner { animation: none; }
          .login-card { opacity: 1; transform: none; }
        }
      `}</style>

      <div className="login-root">

        {/* ══════════════════════════════════════
            LEFT — Photo Panel
        ══════════════════════════════════════ */}
        <div className="login-brand">
          {/* Background photo */}
          <div className="login-brand-photo" />
          {/* Overlay layers */}
          <div className="login-brand-overlay" />
          <div className="login-brand-vignette" />
          <div className="login-brand-shimmer" />

          {/* Content */}
          <div className="login-brand-content">

            {/* ── LOGO ── */}
            <div className="login-logo-wrap">
              <div className="login-logo-glow" />
              <div className="login-logo-ring" />
              <div className="login-logo-border" />
              <div className="login-logo-box">
                <img
                  src="/himasi-icon.png"
                  alt="HIMA SI"
                  className="login-logo-img"
                  onError={(e) => {
                    const t = e.currentTarget;
                    t.style.display = "none";
                    const box = t.parentElement!;
                    const fallback = document.createElement("span");
                    fallback.style.cssText = "font-size:2.5rem;filter:drop-shadow(0 0 12px rgba(59,154,254,0.9))";
                    fallback.textContent = "🎓";
                    box.appendChild(fallback);
                  }}
                />
              </div>
            </div>

            {/* Title */}
            <h1 className="login-brand-title">
              Portal<br />
              <span>HIMA SI</span>
            </h1>

            <p className="login-brand-subtitle">
              Himpunan Mahasiswa Sistem Informasi<br />
              Universitas Terbuka — Bogor
            </p>

          </div>

          <p className="login-brand-footer">© 2024 HIMA SI · Departemen Media & Publikasi</p>
        </div>

        {/* ══════════════════════════════════════
            RIGHT — Form Panel
        ══════════════════════════════════════ */}
        <div className="login-form-panel">

          {/* ── Mobile hero strip (hidden on desktop) ── */}
          <div className="login-mobile-hero">
            <div className="login-mobile-hero-photo" />
            <div className="login-mobile-hero-overlay" />
            <div className="login-mobile-hero-fade" />
            <div className="login-mobile-hero-content">
              <div className="login-mobile-logo-box">
                <img
                  src="/himasi-icon.png"
                  alt="HIMA SI"
                  className="login-mobile-logo-img"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const p = e.currentTarget.parentElement!;
                    p.innerHTML = `<span style="font-size:2rem;filter:drop-shadow(0 0 10px rgba(255,255,255,0.6))">🎓</span>`;
                  }}
                />
              </div>
              <h1 className="login-mobile-hero-title">
                Portal <span>HIMA SI</span>
              </h1>
              <p className="login-mobile-hero-sub">
                Himpunan Mahasiswa Sistem Informasi
              </p>
            </div>
          </div>

          {/* ── Mobile form area ── */}
          <div className="login-mobile-form-area">

            {/* Card */}
            <div className="login-card">

              {/* Header */}
              <div className="login-card-header">
                <h2 className="login-card-title">Selamat datang!</h2>
                <p className="login-card-desc">Masuk menggunakan NIM dan password kamu</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="login-form" noValidate>

                {/* NIM */}
                <div className="login-field">
                  <label htmlFor="nim" className="login-label">NIM</label>
                  <div className="login-input-wrap">
                    <span className="login-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </span>
                    <input
                      id="nim"
                      type="text"
                      value={nim}
                      onChange={(e) => setNim(e.target.value)}
                      required
                      autoComplete="username"
                      placeholder="Masukkan NIM kamu"
                      className="login-input"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="login-field">
                  <label htmlFor="password" className="login-label">Password</label>
                  <div className="login-input-wrap">
                    <span className="login-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      autoComplete="current-password"
                      placeholder="Masukkan password kamu"
                      className="login-input login-input-pw"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="login-pw-toggle"
                      tabIndex={-1}
                      aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    >
                      {showPassword ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2"
                          strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2"
                          strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="login-error" role="alert">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round"
                      style={{ flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit */}
                <button
                  id="login-submit-btn"
                  type="submit"
                  disabled={loading}
                  className="login-submit"
                >
                  {loading ? (
                    <>
                      <span className="login-spinner" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      Masuk ke Portal
                      <span className="login-arrow">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2.5"
                          strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </span>
                    </>
                  )}
                </button>
              </form>

            </div>

            {/* Back link */}
            <div className="login-back-link">
              <Link to="/">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                Kembali ke Beranda
              </Link>
            </div>

            {/* Close mobile form wrapper div */}
          </div>
        </div>
      </div>
    </>
  );
}
