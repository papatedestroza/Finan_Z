export function ProgressBar({ pct }: { pct: number }) {
  const clamped = Math.min(pct, 100);
  const sobregasto = pct >= 100;

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-raised">
      <div
        className={`h-full transition-[width] ${sobregasto ? "bg-alert" : "bg-accent"}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
