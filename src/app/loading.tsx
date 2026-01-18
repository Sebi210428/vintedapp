export default function Loading() {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[9999]">
      <div className="h-1 w-full overflow-hidden bg-white/10">
        <div className="h-full w-1/3 animate-[loadingbar_0.9s_ease-in-out_infinite] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
      </div>
    </div>
  );
}

