import { useUIStore } from '@/store/uiStore';

export default function GlobalOverlay() {
  const loading = useUIStore(s => s.globalLoading);
  const error = useUIStore(s => s.globalError);

  if (!loading && !error) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      {loading && <div className="text-white text-lg">Loading…</div>}
      {error && (
        <div className="bg-red-600 text-white p-4 rounded shadow">
          <p>Error: {error}</p>
        </div>
      )}
    </div>
  );
} 