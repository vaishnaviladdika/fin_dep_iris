import { Download, FileBarChart2 } from 'lucide-react';
import logo from '../assets/LOGO.png';

export default function Header({ activeTab, onDownloadReport }) {
  return (
    <header className="dashboard-header">
      <div className="header-left">
        <img src={logo} alt="Iris Mobility" className="header-logo" />
        {/* <span className="company-tagline">Traffic Analytics Dashboard</span> */}
      </div>
      <div className="header-right">
        <div className="report-buttons">
          <button type="button" className="report-btn" onClick={() => onDownloadReport('daily')}>
            <FileBarChart2 className="btn-icon" />
            Daily
          </button>
          <button type="button" className="report-btn" onClick={() => onDownloadReport('weekly')}>
            <FileBarChart2 className="btn-icon" />
            Weekly
          </button>
          <button type="button" className="report-btn" onClick={() => onDownloadReport('monthly')}>
            <FileBarChart2 className="btn-icon" />
            Monthly
          </button>
        </div>
        <button
          type="button"
          className="download-report-btn"
          onClick={() => onDownloadReport(activeTab)}
        >
          <Download className="btn-icon" />
          Download
        </button>
      </div>
    </header>
  );
}


/*import { Download, FileBarChart2 } from 'lucide-react';
import logo from '../assets/LOGO.png';

const TAB_REPORT_LABELS = {
  overview: 'City Overview Report',
  intersection: 'Intersection Report',
  events: 'Events & Evidence Report',
};

export default function Header({ activeTab, onDownloadReport }) {
  const reportLabel = TAB_REPORT_LABELS[activeTab] || 'Report';

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <img src={logo} alt="Iris Mobility" className="header-logo" />
        {/* <span className="company-tagline">Traffic Analytics Dashboard</span> */
/*</div>
<div className="header-right">
  <div className="report-buttons">
    <button type="button" className="report-btn" onClick={() => onDownloadReport('daily')}>
      <FileBarChart2 className="btn-icon" />
      Daily Report
    </button>
    <button type="button" className="report-btn" onClick={() => onDownloadReport('weekly')}>
      <FileBarChart2 className="btn-icon" />
      Weekly Report
    </button>
    <button type="button" className="report-btn" onClick={() => onDownloadReport('monthly')}>
      <FileBarChart2 className="btn-icon" />
      Monthly Report
    </button>
  </div>
  <button
    type="button"
    className="download-report-btn"
    onClick={() => onDownloadReport(activeTab)}
  >
    <Download className="btn-icon" />
    Download {reportLabel}
  </button>
</div>
</header>
);
}*/



/*import { Download } from 'lucide-react';
import logo from '../assets/LOGO.png';

const TAB_REPORT_LABELS = {
  overview: 'City Overview Report',
  intersection: 'Intersection Report',
  events: 'Events & Evidence Report',
};

export default function Header({ activeTab, onDownloadReport }) {
  const reportLabel = TAB_REPORT_LABELS[activeTab] || 'Report';

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <img src={logo} alt="Iris Mobility" className="header-logo" />
        <span className="company-tagline">Traffic Analytics Dashboard</span>
      </div>
      <div className="header-right">
        <button
          type="button"
          className="download-report-btn"
          onClick={() => onDownloadReport(activeTab)}
        >
          <Download className="btn-icon" />
          Download {reportLabel}
        </button>
      </div>
    </header>
  );
}*/
