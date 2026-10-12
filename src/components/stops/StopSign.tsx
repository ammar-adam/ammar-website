/** Overhead wayfinding sign that opens each stop on the walk through the terminal. */
export function StopSign({ code, name, dest, hint }: { code: string; name: string; dest: string; hint?: string }) {
  return (
    <div className="stop-head">
      <div className="stop-sign">
        <span className="ss-code">{code}</span>
        <span className="ss-name">{name}</span>
        <span className="ss-arrow" aria-hidden>→</span>
        <span className="ss-dest">{dest}</span>
      </div>
      {hint && <p className="stop-hint">{hint}</p>}
    </div>
  );
}
