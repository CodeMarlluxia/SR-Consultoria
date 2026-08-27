"use client";

/**
 * Laser-scan overlay — shown over the drop zone while PapaParse works,
 * before the professionals are revealed. Pure CSS animation.
 */
export function ScannerOverlay({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-card bg-white/85">
      <div className="relative h-[150px] w-[120px] overflow-hidden rounded-lg border-2 border-pastel-serenity/60 bg-pastel-serenity/10">
        {/* stacked "text lines" of the doc */}
        <div className="absolute inset-x-3 top-4 space-y-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-1.5 rounded bg-pastel-lavender/30" style={{ width: `${90 - i * 6}%` }} />
          ))}
        </div>
        {/* the laser line */}
        <div
          className="absolute inset-x-0 h-[3px] animate-[laser_1.4s_ease-in-out_infinite]"
          style={{ background: "#d4b8f0", boxShadow: "0 0 12px 2px #d4b8f0, 0 0 24px 4px rgba(248,180,196,0.6)" }}
        />
      </div>
      <p
        className="eyebrow mt-6">
        Escaneando documento…
      </p>
    </div>
  );
}
