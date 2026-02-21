import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Video } from 'lucide-react';
import { useTrafficData } from '../context/TrafficDataContext';

const DIRECTION_OPTIONS = [
  { value: '', label: 'All directions' },
  { value: 'Northbound', label: 'Northbound' },
  { value: 'Southbound', label: 'Southbound' },
  { value: 'Eastbound', label: 'Eastbound' },
  { value: 'Westbound', label: 'Westbound' },
];

const DAY_OPTIONS = [
  { value: '', label: 'All days' },
  { value: '5', label: 'Sept 5' },
  { value: '6', label: 'Sept 6' },
  { value: '7', label: 'Sept 7' },
  { value: '8', label: 'Sept 8' },
  { value: '9', label: 'Sept 9' },
];

export default function EventsPage() {
  const { weekData, loading, error } = useTrafficData();
  const [directionFilter, setDirectionFilter] = useState('');
  const [dayFilter, setDayFilter] = useState('');

  const events = weekData?.highSpeedEvents || [];

  const filteredEvents = useMemo(() => {
    return events.filter((row) => {
      if (directionFilter && row.direction !== directionFilter) return false;
      if (dayFilter) {
        const day = row.ts?.split(/\s+/)[0]?.split('-')[0];
        if (day !== dayFilter) return false;
      }
      return true;
    });
  }, [events, directionFilter, dayFilter]);

  const handleRowClick = (row) => {
    toast.success('Event details', {
      description: `${row.type} — ${row.direction} • ${row.speedKmh} km/h`,
    });
  };

  return (
    <>
      <div className="clips-section">
        <h2><Video className="section-title-icon" /> High-Speed Events (from CSV)</h2>
        <p className="clips-description">
          Speeding events (≥50 mph) from September 5–9 CSV. No video clips in dataset.
        </p>
      </div>

      <div className="chart-container">
        <h2>Event Log (from CSV)</h2>
        <div className="filters-row">
          <select
            className="select"
            value={directionFilter}
            onChange={(e) => {
              setDirectionFilter(e.target.value);
              toast.info('Filter applied', { description: e.target.value || 'All directions' });
            }}
            aria-label="Filter by direction"
          >
            {DIRECTION_OPTIONS.map((opt) => (
              <option key={opt.value || 'all'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            className="select"
            value={dayFilter}
            onChange={(e) => {
              setDayFilter(e.target.value);
              toast.info('Filter applied', { description: e.target.value ? `Sept ${e.target.value}` : 'All days' });
            }}
            aria-label="Filter by day"
          >
            {DAY_OPTIONS.map((opt) => (
              <option key={opt.value || 'all'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {(directionFilter || dayFilter) && (
            <button
              type="button"
              className="filter-btn"
              onClick={() => {
                setDirectionFilter('');
                setDayFilter('');
                toast.success('Filters cleared');
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Event Type</th>
              <th>Direction</th>
              <th>Speed (km/h)</th>
              <th>Confidence</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="table-empty">Loading CSV…</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5} className="table-empty">{error}</td>
              </tr>
            ) : filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={5} className="table-empty">
                  No speeding events match the filters. Clear filters or check CSV.
                </td>
              </tr>
            ) : (
              filteredEvents.map((row, idx) => (
                <tr
                  key={idx}
                  onClick={() => handleRowClick(row)}
                  className="clickable-row"
                >
                  <td>{row.ts}</td>
                  <td><span className="badge badge-speeding">{row.type}</span></td>
                  <td>{row.direction}</td>
                  <td>{row.speedKmh}</td>
                  <td>{row.confidence}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
