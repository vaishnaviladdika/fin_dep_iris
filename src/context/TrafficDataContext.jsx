import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { fetchFullWeekData, fetchDayStats } from '../data/parseTrafficCsv';

const TrafficDataContext = createContext(null);

export function TrafficDataProvider({ children }) {
  const [weekData, setWeekData] = useState(null);
  const [dailyData, setDailyData] = useState(null);
  const [weeklyData, setWeeklyData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchFullWeekData(80)
      .then(async (data) => {
        setWeekData(data);

        // Daily = latest day (Sept 11 = index 6)
        const daily = await fetchDayStats(6);
        setDailyData(daily);

        // Weekly = all 7 days combined
        setWeeklyData({
          totalVehicles: data.totalVehicles,
          avgSpeedMph: data.avgSpeedMph,
          overLimit: data.overLimit,
        });

        // Monthly = all data combined (September)
        setMonthlyData({
          totalVehicles: data.totalVehicles,
          avgSpeedMph: data.avgSpeedMph,
          overLimit: data.overLimit,
        });

        toast.success('Data loaded', {
          description: `${data.totalVehicles.toLocaleString()} vehicles (Sept 5–11)`,
        });
      })
      .catch((err) => {
        setError(err?.message || 'Failed to load CSV');
        toast.error('Could not load stats', { description: 'Check CSV files in public folder.' });
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <TrafficDataContext.Provider value={{ weekData, dailyData, weeklyData, monthlyData, loading, error }}>
      {children}
    </TrafficDataContext.Provider>
  );
}

export function useTrafficData() {
  const ctx = useContext(TrafficDataContext);
  if (!ctx) throw new Error('useTrafficData must be used inside TrafficDataProvider');
  return ctx;
}
