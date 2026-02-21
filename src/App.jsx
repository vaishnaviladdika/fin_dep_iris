import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Globe2, MapPinned, Video } from 'lucide-react';
import { TrafficDataProvider } from './context/TrafficDataContext';
import Header from './components/Header';
import OverviewPage from './components/OverviewPage';
import IntersectionPage from './components/IntersectionPage';
import EventsPage from './components/EventsPage';
import './App.css';

const TABS = [
  { id: 'overview', label: 'City Overview', icon: Globe2 },
  { id: 'intersection', label: 'Intersection Detail', icon: MapPinned },
  { id: 'events', label: 'Events & Evidence', icon: Video },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [reportType, setReportType] = useState('weekly');
  const pageRef = useRef(null);

  const downloadPageAsPDF = async () => {
    const html2pdf = (await import('html2pdf.js')).default;
    const element = pageRef.current;
    if (!element) return;

    const tabLabel = TABS.find((t) => t.id === activeTab)?.label ?? activeTab;
    const label = `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} – ${tabLabel}`;
    const filename = `${tabLabel.replace(/\s+/g, '-').toLowerCase()}-${reportType}-report.pdf`;

    const id = toast.loading(`Generating ${label} PDF…`);

    const opt = {
      margin: 0.5,
      filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
    };

    try {
      await html2pdf().set(opt).from(element).save();
      toast.success(`${label} PDF downloaded!`, { id });
    } catch (err) {
      toast.error('PDF generation failed', { id });
    }
  };

  // Only sets the report type — does NOT trigger download
  const handleSelectReportType = (type) => {
    setReportType(type);
    const label = type.charAt(0).toUpperCase() + type.slice(1);
    toast.info(`${label} report selected`, { description: 'Click Download to export', duration: 2000 });
  };

  // Only called when Download button is clicked
  const handleDownload = () => {
    downloadPageAsPDF();
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    const label = TABS.find((t) => t.id === tabId)?.label ?? tabId;
    toast.success(label, { description: 'View updated', duration: 2000 });
  };

  return (
    <TrafficDataProvider>
      <div className="dashboard-wrap">
        <div className="container">
          <Header
            activeTab={activeTab}
            reportType={reportType}
            onSelectReportType={handleSelectReportType}
            onDownload={handleDownload}
          />

          <nav className="tabs" role="tablist" aria-label="Dashboard sections">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
                id={`tab-${tab.id}`}
                className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => handleTabChange(tab.id)}
              >
                {tab.icon && <tab.icon className="tab-icon" />}
                {tab.label}
              </button>
            ))}
          </nav>

          <main ref={pageRef}>
            <div
              id="panel-overview"
              role="tabpanel"
              aria-labelledby="tab-overview"
              className={`page ${activeTab === 'overview' ? 'active' : ''}`}
            >
              {activeTab === 'overview' && <OverviewPage reportType={reportType} />}
            </div>

            <div
              id="panel-intersection"
              role="tabpanel"
              aria-labelledby="tab-intersection"
              className={`page ${activeTab === 'intersection' ? 'active' : ''}`}
            >
              {activeTab === 'intersection' && <IntersectionPage />}
            </div>

            <div
              id="panel-events"
              role="tabpanel"
              aria-labelledby="tab-events"
              className={`page ${activeTab === 'events' ? 'active' : ''}`}
            >
              {activeTab === 'events' && <EventsPage />}
            </div>
          </main>
        </div>
      </div>
    </TrafficDataProvider>
  );
}
