// Quiet backdrop: a faint navy grid that fades out toward the top and bottom.
export function GridBackground({ className = '' }: { className?: string; density?: number }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Grid lines */}
      <div className="absolute inset-0 opacity-[0.05]" style={{
        backgroundImage: `linear-gradient(rgba(31,40,80,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(31,40,80,0.6) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
      }} />

      {/* Top fade */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-cream to-transparent" />
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cream to-transparent" />
    </div>
  );
}
