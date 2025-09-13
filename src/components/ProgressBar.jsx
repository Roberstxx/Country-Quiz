export default function ProgressBar({ value = 0, max = 1 }){
  const pct = Math.round((value / (max || 1)) * 100);
  return (
    <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
      <div className="progress-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}
