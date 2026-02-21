import { Download, FileBarChart2 } from 'lucide-react';
import logo from '../assets/LOGO.png';

const REPORT_TYPES = ['daily', 'weekly', 'monthly'];

export default function Header({ activeTab, reportType, onSelectReportType, onDownload }) {
  return (
    <header className="dashboard-header">
      <div className="header-left">
        <img src={logo} alt="Iris Mobility" className="header-logo" />
      </div>
      <div className="header-right">
        <div className="report-buttons">
          {REPORT_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              className={`report-btn ${reportType === type ? 'active' : ''}`}
              onClick={() => onSelectReportType(type)}
            >
              <FileBarChart2 className="btn-icon" />
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="download-report-btn"
          onClick={onDownload}
        >
          <Download className="btn-icon" />
          Download
        </button>
      </div>
    </header>
  );
}
