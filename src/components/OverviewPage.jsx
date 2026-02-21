import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, Area, AreaChart, BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';
import { toast } from 'sonner';
import StatCard from './StatCard';
import RiskHeatmap from './RiskHeatmap';
import { useTrafficData } from '../context/TrafficDataContext';

export default function OverviewPage({ reportType }) {
  const { weekData, dailyData, weeklyData, monthlyData, loading, error } = useTrafficData();

  const reportData =
    reportType === 'daily' ? dailyData :
      reportType === 'weekly' ? weeklyData :
        reportType === 'monthly' ? monthlyData :
          weekData;

  const reportLabel =
    reportType === 'daily' ? 'Daily (Sept 11)' :
      reportType === 'weekly' ? 'Weekly (Sept 5–11)' :
        reportType === 'monthly' ? 'Monthly (September)' :
          'Sept 5–11';

  const handleIntersectionClick = (item) => {
    toast.info(`#${item.rank} ${item.name}`, { description: item.stats });
  };

  return (
    <>
      <div className="stats-grid">
        <StatCard
          title="Total Vehicles"
          value={loading ? '…' : error ? '—' : reportData?.totalVehicles?.toLocaleString() ?? '—'}
          change={reportLabel}
        />
        <StatCard title="Pedestrians" value="—" change={reportLabel} />
        <StatCard
          title="Violations"
          value={loading ? '…' : error ? '—' : reportData?.overLimit?.toLocaleString() ?? '—'}
          change="Speed ≥50 mph"
        />
        <StatCard
          title="Average Speed"
          value={loading ? '…' : error ? '—' : reportData?.avgSpeedMph ?? '—'}
          change="mph"
        />
      </div>

      <div className="chart-container">
        <h2>Top Flows by Direction</h2>
        <div className="intersection-list">
          {(weekData?.topFlowsByDirection || []).map((item) => (
            <button
              key={item.rank}
              type="button"
              className="intersection-item intersection-item--btn"
              onClick={() => handleIntersectionClick(item)}
              onTouchStart={() => handleIntersectionClick(item)}
            >
              <span className="intersection-rank">{item.rank}</span>
              <div className="intersection-info">
                <div className="intersection-name">{item.name}</div>
                <div className="intersection-stats">{item.stats}</div>
              </div>
            </button>
          ))}
          {!loading && !error && (!weekData?.topFlowsByDirection?.length) && (
            <p className="chart-empty">No direction data. Check CSV files.</p>
          )}
        </div>
      </div>

      <RiskHeatmap riskByHour={weekData?.riskByHour} />

      <div className="chart-container">
        <h2>Vehicle Frequency Throughout Day</h2>
        <div className="chart-inner chart-inner--tall">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={weekData?.vehicleFrequencyByHour || []}
              layout="vertical"
              margin={{ left: 8, right: 16 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-200)" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="label" width={64} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [v?.toLocaleString?.() ?? v, 'Vehicles']} />
              <Bar dataKey="value" fill="var(--green-500)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-container">
        <h2>Vehicle Classification by Hour</h2>
        <div className="chart-inner chart-inner--tall">
          <ResponsiveContainer width="100%" height={340}>
            <AreaChart data={weekData?.vehicleTrendByHour || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-200)" />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="cars" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
              <Area type="monotone" dataKey="trucks" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
              <Area type="monotone" dataKey="buses" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-container pie-container">
        <h2>Vehicle Class Distribution</h2>
        <div className="pie-chart-wrap">
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={weekData?.classDistribution || []}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={160}
              >
                {(weekData?.classDistribution || []).map((entry, i) => (
                  <Cell key={i} fill={entry.color} stroke="#fff" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
