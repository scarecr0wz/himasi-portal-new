import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean; error?: Error };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("App error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
          <h1 className="text-slate-800 text-xl font-bold mb-2">Terjadi kesalahan</h1>
          <p className="text-slate-600 text-sm mb-4 max-w-md">
            Halaman tidak dapat dimuat. Coba refresh atau buka lagi nanti.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:opacity-90"
          >
            Muat ulang
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
