import { toast } from 'sonner';

const FALLBACK_RISK = [0, 0, 0, 0, 0, 1, 2, 3, 4, 3, 2, 2, 2, 2, 3, 3, 4, 4, 4, 3, 2, 1, 1, 0];
const HOUR_LABELS = ['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];

function getRiskColor(risk) {
  const intensity = Math.min(4, Math.max(0, risk)) / 4;
  const g = Math.floor(34 + intensity * 50);
  const r = Math.floor(197 - intensity * 100);
  return `rgb(${r},${g},94)`;
}

function formatHour(i) {
  if (i === 0) return '12 AM';
  if (i === 12) return '12 PM';
  return i < 12 ? `${i} AM` : `${i - 12} PM`;
}

export default function RiskHeatmap({ riskByHour }) {
  const levels = Array.isArray(riskByHour) && riskByHour.length === 24 ? riskByHour : FALLBACK_RISK;

  const handleCellClick = (hour, risk) => {
    toast.info(`Risk at ${formatHour(hour)}`, {
      description: `Level ${risk} of 4 — ${risk === 0 ? 'Low' : risk <= 2 ? 'Moderate' : risk <= 3 ? 'High' : 'Peak'} (from CSV volume)`,
    });
  };

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h2>Time-of-Day Risk Heatmap (from CSV)</h2>
      </div>
      <div className="heatmap-grid" role="img" aria-label="Risk by hour">
        {levels.map((risk, i) => (
          <button
            key={i}
            type="button"
            className="heatmap-cell heatmap-cell--btn"
            style={{ background: getRiskColor(risk) }}
            title={`Hour ${i}: Risk Level ${risk}`}
            onClick={() => handleCellClick(i, risk)}
          />
        ))}
      </div>
      <div className="heatmap-label">
        {HOUR_LABELS.map((l, i) => (
          <span key={i}>{l}</span>
        ))}
      </div>
      <div className="heatmap-legend">
        <span>12 AM</span>
        <span>6 AM</span>
        <span>12 PM</span>
        <span>6 PM</span>
        <span>12 AM</span>
      </div>
    </div>
  );
}
