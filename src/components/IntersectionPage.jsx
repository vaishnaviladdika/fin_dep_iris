import { useState } from 'react';
import { toast } from 'sonner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, Legend, Area, AreaChart
} from 'recharts';
import SpeedHeatmap from './SpeedHeatmap';
import { useTrafficData } from '../context/TrafficDataContext';

const INTERSECTION_OPTIONS = [
  { id: 'main', name: 'Main St & 5th Ave' },
  { id: 'oak', name: 'Oak Blvd & Elm St' },
  { id: 'park', name: 'Park Ave & Broadway' },
];

export default function IntersectionPage() {
  const { weekData, loading, error } = useTrafficData();
  const [selectedIntersection, setSelectedIntersection] = useState(INTERSECTION_OPTIONS[0].name);

  const handleIntersectionChange = (e) => {
    const name = e.target.value;
    setSelectedIntersection(name);
    toast.success('Intersection updated', { description: name });
  };

  const speedingTotal = weekData?.overLimit ?? 0;

  const violationsFromCsv = [
    { type: 'Speeding ≥50 mph', value: speedingTotal, className: 'speeding' },
  ];

  return (
    <>
      {/* Intersection selector */}
      <div className="chart-container">
        <div className="chart-header">
          <h2>Intersection: {selectedIntersection}</h2>
          <select
            className="select"
            value={selectedIntersection}
            onChange={handleIntersectionChange}
            aria-label="Select intersection"
          >
            {INTERSECTION_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.name}>
                {opt.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Violation Types */}
      <div className="chart-container">
        <h2>Violation Types</h2>
        <div className="violations-grid">
          {violationsFromCsv.map((v) => (
            <button
              key={v.type}
              type="button"
              className={`violation-card violation-card--btn ${v.className}`}
              onClick={() =>
                toast.info(v.type, {
                  description: `${v.value} this week (Sept 5–9)`,
                })
              }
            >
              <h4>{v.type}</h4>
              <div className="value">{loading ? '…' : v.value.toLocaleString()}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Time-of-Day Risk Heatmap */}
      <SpeedHeatmap onReport={() => { }} />

      {/* Vehicle Counts by Direction & Type */}
      <div className="chart-container">
        <h2>Vehicle Counts by Direction & Type</h2>
        <div className="chart-inner chart-inner--tall">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={weekData?.directionClassBars || []}
              margin={{ top: 24, right: 16, bottom: 48, left: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-200)" />
              <XAxis dataKey="label" angle={-25} textAnchor="end" height={64} tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [v?.toLocaleString?.(), 'Count']} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {(weekData?.directionClassBars || []).map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Speeding Trend by Day */}
      <div className="chart-container">
        <h2>Speeding Trend by Day</h2>
        <div className="chart-inner chart-inner--tall">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={weekData?.speedingByDay || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-200)" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 13 }} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.3}
                name="Speeding ≥50 mph"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Violation Count by Day */}
      <div className="chart-container">
        <h2>Violation Count by Day</h2>
        <div className="chart-inner chart-inner--tall">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={weekData?.speedingByDay || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-200)" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 13 }} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.3}
                name="Speeding events"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}