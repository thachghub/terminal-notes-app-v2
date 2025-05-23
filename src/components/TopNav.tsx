// src/components/TopNav.tsx

export default function TopNav() {
  return (
    <div className="flex items-center h-full space-x-2">
      {/* Toggle Button */}
      <button className="h-8 px-3 border border-cyan-500 text-cyan-300 hover:text-black hover:bg-cyan-500">
        &gt;
      </button>

      {/* Nav Buttons */}
      <button className="h-8 px-4 border border-cyan-500 text-cyan-300 hover:text-black hover:bg-cyan-500">
        &gt; New Note
      </button>
      <button className="h-8 px-4 border border-cyan-500 text-cyan-300 hover:text-black hover:bg-cyan-500">
        &gt; View Notes
      </button>
      <button className="h-8 px-4 border border-cyan-500 text-cyan-300 hover:text-black hover:bg-cyan-500">
        &gt; Log Entry
      </button>
      <button className="h-8 px-4 border border-cyan-500 text-cyan-300 hover:text-black hover:bg-cyan-500">
        &gt; Settings
      </button>
      <button className="h-8 px-4 border border-cyan-500 text-cyan-300 hover:text-black hover:bg-cyan-500">
        &gt; Log-in-out
      </button>
    </div>
  );
}