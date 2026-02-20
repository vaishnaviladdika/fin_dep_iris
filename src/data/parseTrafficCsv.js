import { SEPTEMBER_CSV_DAYS, getCsvUrl } from './csvPaths.js';

/** Parse "DD-MM-YYYY HH:MM" to hour 0-23 */
function parseHour(timestamp) {
  if (!timestamp || typeof timestamp !== 'string') return 0;
  const part = timestamp.trim().split(/\s+/)[1];
  if (!part) return 0;
  const h = parseInt(part.split(':')[0], 10);
  return Number.isNaN(h) ? 0 : Math.min(23, Math.max(0, h));
}

function parseCsvRow(parts, dayLabel = null) {
  if (parts.length < 6) return null;
  const timestamp = (parts[0] || '').trim();
  const cls = (parts[1] || '').trim().toLowerCase();
  const entry = (parts[2] || '').trim().toUpperCase();
  const speedKmh = parseFloat(parts[5], 10);
  if (Number.isNaN(speedKmh)) return null;
  return {
    hour: parseHour(timestamp),
    class: cls === 'car' || cls === 'truck' || cls === 'bus' ? cls : 'car',
    entry,
    speedKmh,
    day: dayLabel,
  };
}

function parseCsvToFullRows(text, dayLabel = null) {
  const lines = text.trim().split(/\r?\n/);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',');
    const row = parseCsvRow(parts, dayLabel);
    if (row) rows.push(row);
  }
  return rows;
}

function parseCsvText(text) {
  const lines = text.trim().split(/\r?\n/);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',');
    if (parts.length >= 6) {
      rows.push({
        entry: (parts[2] || '').trim(),
        speedKmh: parseFloat(parts[5], 10),
      });
    }
  }
  return rows;
}

export function aggregateByEntry(rows) {
  const byEntry = {};
  const dirOrder = ['NORTH', 'SOUTH', 'EAST', 'WEST'];
  dirOrder.forEach((d) => {
    byEntry[d] = { sum: 0, count: 0 };
  });
  rows.forEach((r) => {
    const entry = r.entry?.toUpperCase?.() || r.entry;
    if (byEntry[entry]) {
      if (!Number.isNaN(r.speedKmh)) {
        byEntry[entry].sum += r.speedKmh;
        byEntry[entry].count += 1;
      }
    }
  });
  return dirOrder.map((dir) => {
    const { sum, count } = byEntry[dir];
    const avgKmh = count > 0 ? sum / count : 0;
    const avgMph = avgKmh / 1.609;
    return {
      id: dir.toLowerCase(),
      label: dir.charAt(0) + dir.slice(1).toLowerCase() + 'bound',
      avgSpeedKmh: Math.round(avgKmh * 10) / 10,
      avgSpeedMph: Math.round(avgMph * 10) / 10,
      volume: count,
    };
  });
}

export async function fetchAndParseCsv(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}`);
  const text = await res.text();
  const rows = parseCsvText(text);
  return aggregateByEntry(rows);
}

export function getCsvStats(text, speedLimitKmh = 80) {
  const rows = parseCsvText(text);
  let sumSpeed = 0;
  let count = 0;
  let overLimit = 0;
  rows.forEach((r) => {
    if (!Number.isNaN(r.speedKmh)) {
      sumSpeed += r.speedKmh;
      count += 1;
      if (r.speedKmh >= speedLimitKmh) overLimit += 1;
    }
  });
  const avgSpeedKmh = count > 0 ? sumSpeed / count : 0;
  return { totalVehicles: count, avgSpeedKmh, overLimit };
}

export async function fetchCsvStats(url, speedLimitKmh = 80) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}`);
  const text = await res.text();
  return getCsvStats(text, speedLimitKmh);
}

export async function fetchAllSeptemberStats(speedLimitKmh = 80) {
  let totalVehicles = 0;
  let totalSpeedSum = 0;
  let totalOverLimit = 0;
  for (const { file } of SEPTEMBER_CSV_DAYS) {
    const stats = await fetchCsvStats(getCsvUrl(file), speedLimitKmh);
    totalVehicles += stats.totalVehicles;
    totalSpeedSum += stats.totalVehicles * stats.avgSpeedKmh;
    totalOverLimit += stats.overLimit;
  }
  const avgSpeedKmh = totalVehicles > 0 ? totalSpeedSum / totalVehicles : 0;
  const avgSpeedMph = avgSpeedKmh / 1.609;
  return {
    totalVehicles,
    avgSpeedKmh: Math.round(avgSpeedKmh * 10) / 10,
    avgSpeedMph: Math.round(avgSpeedMph * 10) / 10,
    overLimit: totalOverLimit,
  };
}

const SPEED_LIMIT_KMH = 80;

export async function fetchFullWeekData(speedLimitKmh = SPEED_LIMIT_KMH) {
  const allRows = [];
  const dayNames = ['Sept 5', 'Sept 6', 'Sept 7', 'Sept 8', 'Sept 9', 'Sept 10', 'Sept 11'];

  for (let i = 0; i < SEPTEMBER_CSV_DAYS.length; i++) {
    const { file } = SEPTEMBER_CSV_DAYS[i];
    const res = await fetch(getCsvUrl(file));
    if (!res.ok) throw new Error(`Failed to load ${file}`);
    const text = await res.text();
    const rows = parseCsvToFullRows(text, i);
    allRows.push(...rows);
  }

  const dirOrder = ['NORTH', 'SOUTH', 'EAST', 'WEST'];

  const byHour = Array.from({ length: 24 }, () => ({ count: 0, overLimit: 0 }));
  const byClass = { car: 0, truck: 0, bus: 0 };
  const byDay = Array.from({ length: SEPTEMBER_CSV_DAYS.length }, () => ({ count: 0, overLimit: 0 }));
  const byEntry = {};
  dirOrder.forEach((d) => {
    byEntry[d] = { count: 0, sumSpeed: 0, car: 0, truck: 0, bus: 0 };
  });
  const byHourClass = Array.from({ length: 24 }, () => ({ car: 0, truck: 0, bus: 0 }));
  const highSpeedEvents = [];

  allRows.forEach((r) => {
    const h = r.hour;
    byHour[h].count += 1;
    if (r.speedKmh >= speedLimitKmh) {
      byHour[h].overLimit += 1;
      byDay[r.day].overLimit += 1;
      highSpeedEvents.push({
        ts: `${SEPTEMBER_CSV_DAYS[r.day].day}-09-2017 ${String(h).padStart(2, '0')}:00`,
        type: 'Speeding',
        direction: r.entry.charAt(0) + r.entry.slice(1).toLowerCase() + 'bound',
        speedKmh: Math.round(r.speedKmh * 10) / 10,
        confidence: `${Math.min(99, Math.round(70 + (r.speedKmh - speedLimitKmh) / 2))}%`,
      });
    }
    byDay[r.day].count += 1;
    byClass[r.class] = (byClass[r.class] || 0) + 1;
    byHourClass[h][r.class] += 1;
    if (byEntry[r.entry]) {
      byEntry[r.entry].count += 1;
      byEntry[r.entry].sumSpeed += r.speedKmh;
      byEntry[r.entry][r.class] += 1;
    }
  });

  const totalVehicles = allRows.length;
  const totalSpeedSum = allRows.reduce((s, r) => s + r.speedKmh, 0);
  const avgSpeedKmh = totalVehicles > 0 ? totalSpeedSum / totalVehicles : 0;
  const totalOverLimit = highSpeedEvents.length;

  const topFlowsByDirection = dirOrder.map((dir) => {
    const d = byEntry[dir];
    const count = d.count;
    const avgKmh = count > 0 ? d.sumSpeed / count : 0;
    return {
      rank: 0,
      name: dir.charAt(0) + dir.slice(1).toLowerCase() + 'bound',
      stats: `${count.toLocaleString()} vehicles • avg ${Math.round(avgKmh)} km/h • ${d.car} car, ${d.truck} truck, ${d.bus} bus`,
      volume: count,
    };
  });
  topFlowsByDirection.sort((a, b) => b.volume - a.volume);
  topFlowsByDirection.forEach((f, i) => { f.rank = i + 1; });

  const vehicleFrequencyByHour = byHour.map((h, i) => {
    const label = i === 0 ? '12 AM' : i === 12 ? '12 PM' : i < 12 ? `${i} AM` : `${i - 12} PM`;
    return { label, value: h.count };
  });

  const vehicleTrendByHour = byHourClass.map((h, i) => {
    const label = i === 0 ? '12 AM' : i === 12 ? '12 PM' : i < 12 ? `${i} AM` : `${i - 12} PM`;
    return { time: label, cars: h.car, trucks: h.truck, buses: h.bus };
  });

  const classDistribution = [
    { name: 'Car', value: byClass.car, color: '#3b82f6' },
    { name: 'Truck', value: byClass.truck, color: '#f59e0b' },
    { name: 'Bus', value: byClass.bus, color: '#10b981' },
  ].filter((d) => d.value > 0);

  const totalClass = classDistribution.reduce((s, d) => s + d.value, 0);
  classDistribution.forEach((d) => {
    d.percent = totalClass > 0 ? Math.round((d.value / totalClass) * 1000) / 10 : 0;
  });

  const riskByHour = byHour.map((h) => {
    const maxCount = Math.max(...byHour.map((x) => x.count), 1);
    const level = Math.min(4, Math.floor((h.count / maxCount) * 4));
    return level;
  });

  const directionClassBars = [];
  dirOrder.forEach((dir) => {
    const d = byEntry[dir];
    const label = dir.charAt(0) + dir.slice(1).toLowerCase();
    if (d.car) directionClassBars.push({ label: `${label} Car`, value: d.car, fill: 'var(--green-500)' });
    if (d.truck) directionClassBars.push({ label: `${label} Truck`, value: d.truck, fill: '#f59e0b' });
    if (d.bus) directionClassBars.push({ label: `${label} Bus`, value: d.bus, fill: '#10b981' });
  });

  const speedingByDay = byDay.map((d, i) => ({
    day: dayNames[i],
    count: d.overLimit,
  }));

  return {
    totalVehicles,
    avgSpeedKmh: Math.round(avgSpeedKmh * 10) / 10,
    avgSpeedMph: Math.round(avgSpeedKmh / 1.609 * 10) / 10,
    overLimit: totalOverLimit,
    topFlowsByDirection,
    vehicleFrequencyByHour,
    vehicleTrendByHour,
    classDistribution,
    riskByHour,
    directionClassBars,
    speedingByDay,
    highSpeedEvents: highSpeedEvents.slice(0, 100),
  };
}

// Fetch stats for a single day by index (0 = Sept 5, 6 = Sept 11)
export async function fetchDayStats(dayIndex, speedLimitKmh = 80) {
  const { file } = SEPTEMBER_CSV_DAYS[dayIndex];
  const res = await fetch(getCsvUrl(file));
  if (!res.ok) throw new Error(`Failed to load ${file}`);
  const text = await res.text();
  const stats = getCsvStats(text, speedLimitKmh);
  return {
    totalVehicles: stats.totalVehicles,
    avgSpeedMph: Math.round((stats.avgSpeedKmh / 1.609) * 10) / 10,
    overLimit: stats.overLimit,
  };
}
