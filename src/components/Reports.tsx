import { useState, useRef, useEffect } from 'react';
import { generateReport, getReportsMeta, getReportsList, downloadReport, handleApiError } from '../apis/user/api';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useAuth } from '../contexts/AuthContext';

// Report generation types
interface GenerateReportRequest {
  type: string;
  month: number;
}

// Reports metadata interface
interface ReportsMetaData {
  totalRides: number;
  completionRate: number;
}

// Reports list interface
interface ReportItem {
  id: number;
  type: string;
  month: number;
  year: number;
  companyId: number;
  creatorId: number;
  createdAt: string;
}

const DownloadIcon = () => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>;
const ChevronDownIcon = () => <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"/></svg>;

interface CustomDropdownProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}

const CustomDropdown = ({ options, value, onChange, placeholder, className = "" }: CustomDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black focus:border-black appearance-none bg-white text-black text-left flex items-center justify-between text-xs cursor-pointer"
      >
        <span>{value || placeholder}</span>
        <ChevronDownIcon />
      </button>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-auto">
          {options.map((option, index) => (
            <button
              key={index}
              type="button"
              onClick={() => { onChange(option); setIsOpen(false); }}
              className={`w-full px-2 py-1.5 text-left hover:bg-yellow-100 focus:bg-yellow-100 focus:outline-none cursor-pointer ${
                value === option ? 'bg-yellow-100' : 'bg-white'
              } text-black text-xs`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Reports = () => {
  const { user } = useAuth();
  const [reportType, setReportType] = useState('Leaderboard Report');
  // const [selectedMonth, setSelectedMonth] = useState('September 2025');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generateSuccess, setGenerateSuccess] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('generated');
  const [sortOrder, setSortOrder] = useState('desc');
  const [typeFilter, setTypeFilter] = useState('');
  const [periodFilter, setPeriodFilter] = useState('');
  const [sortFilter, setSortFilter] = useState('newest');

  // Reports metadata state
  const [reportsMeta, setReportsMeta] = useState<ReportsMetaData>({
    totalRides: 0,
    completionRate: 0
  });
  const [metaLoading, setMetaLoading] = useState(true);
  const [metaError, setMetaError] = useState<string | null>(null);
  
  // Reports list state
  const [reportsList, setReportsList] = useState<ReportItem[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalReports, setTotalReports] = useState(0);
  const [reportsFetched, setReportsFetched] = useState(false);
  
  // Download state
  const [downloadingReports, setDownloadingReports] = useState<Set<number>>(new Set());
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const getPreviousMonthYear = () => {
  const now = new Date();
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthName = monthNames[prevMonth.getMonth()];
  const year = prevMonth.getFullYear();
  return `${monthName} ${year}`;
};

const [selectedMonth, setSelectedMonth] = useState(getPreviousMonthYear());
const months = Array.from({ length: 12 }, (_, i) => {
  const date = new Date();
  date.setMonth(date.getMonth() - (i + 1));
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
});
  const reportTypes = ['Leaderboard Report', 'Oxygen Safe Report', 'Annual Summary Report'];
  // const months = ['January 2025', 'February 2025', 'March 2025', 'April 2025', 'May 2025', 'June 2025', 'July 2025', 'August 2025', 'September 2025', 'October 2025', 'November 2025', 'December 2025'];

  // Fetch reports metadata from API
  const fetchReportsMeta = async () => {
    if (!user?.companyId) return;
    
    try {
      setMetaLoading(true);
      setMetaError(null);
      const response = await getReportsMeta(user.companyId);
      setReportsMeta(response.data);
    } catch (error) {
      console.error('Failed to fetch reports metadata:', error);
      setMetaError(handleApiError(error));
    } finally {
      setMetaLoading(false);
    }
  };

  // Fetch reports list from API
  const fetchReportsList = async (page: number = 1, limit: number = 10) => {
    try {
      setListLoading(true);
      setListError(null);
      const response = await getReportsList(page, limit, typeFilter || undefined, undefined, undefined);
      setReportsList(response.data);
      setCurrentPage(response.metaData.page);
      setTotalReports(response.metaData.total);
    } catch (error) {
      console.error('Failed to fetch reports list:', error);
      setListError(handleApiError(error));
    } finally {
      setListLoading(false);
    }
  };

  // Fetch metadata on component mount
  useEffect(() => {
    fetchReportsMeta();
  }, [user?.companyId]);

  // Fetch reports list on component mount and when filters change
  useEffect(() => {
    if (!reportsFetched) {
      fetchReportsList(currentPage, 10);
      setReportsFetched(true);
    }
  }, [currentPage, typeFilter, reportsFetched]);

  // Map report type names to API values
  const getReportTypeValue = (reportType: string): string => {
    const typeMap: { [key: string]: string } = {
      'Leaderboard Report': 'LEADERBOARD',
      'Oxygen Safe Report': 'OXYGENREPORT',
      'Annual Summary Report': 'ANNUALSUMMARYREPORT'
    };
    return typeMap[reportType] || 'LEADERBOARD';
  };

  // Convert month name to number
  const getMonthNumber = (monthString: string): number => {
    const monthMap: { [key: string]: number } = {
      'January 2025': 1, 'February 2025': 2, 'March 2025': 3, 'April 2025': 4,
      'May 2025': 5, 'June 2025': 6, 'July 2025': 7, 'August 2025': 8,
      'September 2025': 9, 'October 2025': 10, 'November 2025': 11, 'December 2025': 12
    };
    return monthMap[monthString] || 9;
  };

  // Map API report type to display name
  const getDisplayReportType = (apiType: string): string => {
    const typeMap: { [key: string]: string } = {
      'LEADERBOARD': 'Leaderboard Report',
      'OXYGENREPORT': 'Oxygen Safe Report',
      'ANNUALSUMMARYREPORT': 'Annual Summary Report'
    };
    return typeMap[apiType] || apiType;
  };

  // Get month name from number
  const getMonthName = (month: number): string => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month - 1] || `Month ${month}`;
  };

  // Convert API data to display format
  const convertApiReportsToDisplay = (apiReports: ReportItem[]) => {
    return apiReports.map(report => ({
      id: report.id,
      report: getDisplayReportType(report.type),
      period: `${getMonthName(report.month)} ${report.year}`,
      generated: report.createdAt,
      actions: 'Download'
    }));
  };

  // Download report function
  const handleDownloadReport = async (reportId: number, reportName: string) => {
    try {
      setDownloadingReports(prev => new Set(prev).add(reportId));
      setDownloadError(null);
      
      const blob = await downloadReport(reportId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportName}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Download failed:', error);
      setDownloadError(handleApiError(error));
    } finally {
      setDownloadingReports(prev => {
        const newSet = new Set(prev);
        newSet.delete(reportId);
        return newSet;
      });
    }
  };

  // Convert hex string to PDF and download
  const downloadHexAsPDF = (hexData: string, filename: string) => {
    try {
      console.log('Converting hex to PDF. Hex data preview:', hexData.substring(0, 50));
      
      // Convert hex to bytes
      const hexPairs = hexData.match(/.{1,2}/g);
      if (!hexPairs) {
        throw new Error('Invalid hex data format');
      }
      
      const bytes = new Uint8Array(hexPairs.map(byte => parseInt(byte, 16)));
      console.log('Converted to bytes. Length:', bytes.length);
      
      // Create blob
      const blob = new Blob([bytes], { type: 'application/pdf' });
      console.log('Created blob. Size:', blob.size);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('PDF download initiated for:', filename);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      setGenerateError(`Failed to download PDF file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };


  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setGenerateError(null);
    setGenerateSuccess(null);

    try {
      const reportData: GenerateReportRequest = {
        type: getReportTypeValue(reportType),
        month: getMonthNumber(selectedMonth)
      };

      console.log('Generating report with data:', reportData);
      
      const response = await generateReport(reportData);
      
      console.log('Report generation response:', response);
      
      if (response.success && response.data) {
        // Generate filename
        const monthName = selectedMonth.split(' ')[0];
        const filename = `${reportType.replace(/\s+/g, '_')}_${monthName}_2025.pdf`;
        
        console.log('Downloading PDF with filename:', filename);
        console.log('Hex data length:', response.data.length);
        
        // Download the PDF
        downloadHexAsPDF(response.data, filename);
        
        setGenerateSuccess(`Report generated and downloaded successfully!`);
        
        // Clear success message after 5 seconds
        setTimeout(() => setGenerateSuccess(null), 5000);
      } else {
        setGenerateError(response.message || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Report generation error:', error);
      setGenerateError(handleApiError(error));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSort = (column: string) => {
    setSortBy(column);
    setSortOrder(sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc');
    // Reset dropdown sort when clicking table headers
    setSortFilter('');
  };

  const clearFilters = () => {
    setTypeFilter('');
    setPeriodFilter('');
    setSortFilter('newest');
    setSortBy('generated');
    setSortOrder('desc');
    // Refresh data when filters are cleared
    fetchReportsList(1, 10);
    setCurrentPage(1);
  };

  // Convert API data to display format and apply filters/sorting
  const displayReports = convertApiReportsToDisplay(reportsList);
  
  const filteredAndSortedReports = displayReports
    .filter(report => {
      const typeMatch = !typeFilter || report.report === typeFilter;
      const periodMatch = !periodFilter || report.period.toLowerCase().includes(periodFilter.toLowerCase());
      return typeMatch && periodMatch;
    })
    .sort((a, b) => {
      // Apply dropdown sort filter first
      let sortColumn = sortBy;
      let sortDirection = sortOrder;
      
      switch (sortFilter) {
        case 'newest':
          sortColumn = 'generated';
          sortDirection = 'desc';
          break;
        case 'oldest':
          sortColumn = 'generated';
          sortDirection = 'asc';
          break;
        case 'name':
          sortColumn = 'report';
          sortDirection = 'asc';
          break;
        case 'period':
          sortColumn = 'period';
          sortDirection = 'asc';
          break;
      }

      const getValue = (report: any) => {
        switch (sortColumn) {
          case 'report': return report.report.toLowerCase();
          case 'period': return report.period.toLowerCase();
          case 'generated': return new Date(report.generated).getTime();
          default: return report.generated;
        }
      };
      const aVal = getValue(a), bVal = getValue(b);
      return sortDirection === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });

  const SortIcon = ({ column }: { column: string }) => {
    const isActive = sortBy === column;
    const isAsc = sortOrder === 'asc';
    const color = isActive ? 'text-gray-600' : 'text-gray-400';
    const path = isActive ? (isAsc ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7') : 'M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4';
    
    return (
      <svg className={`w-4 h-4 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
      </svg>
    );
  };

  // Create dynamic card data with API data for first and last cards
  const cardData = [
    { 
      title: 'Total Rides', 
      value: metaLoading ? 'Loading...' : metaError ? 'Error' : reportsMeta.totalRides.toString(), 
      subtitle: 'This month', 
      icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z', 
      bg: 'bg-[#FFEECC]', 
      text: 'text-[#FFC11E]',
      isLoading: metaLoading,
      isError: metaError
    },
    { 
      title: 'Safety Score', 
      value: '0%', 
      subtitle: 'No data', 
      icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', 
      bg: 'bg-green-100', 
      text: 'text-green-600',
      isLoading: false,
      isError: false
    },
    { 
      title: 'Cost Savings', 
      value: '$0', 
      subtitle: 'No data', 
      icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z', 
      bg: 'bg-blue-100', 
      text: 'text-blue-600',
      isLoading: false,
      isError: false
    },
    { 
      title: 'Completion Rate', 
      value: metaLoading ? 'Loading...' : metaError ? 'Error' : `${reportsMeta.completionRate}%`, 
      subtitle: 'Perfect score', 
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', 
      bg: 'bg-purple-100', 
      text: 'text-purple-600',
      isLoading: metaLoading,
      isError: metaError
    }
  ];

  return (
    <div className="flex-1 min-h-screen">
      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <h2 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4">Report Preview - 2025 09</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {cardData.map((card, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-3 sm:p-4 hover:shadow-md transition-all duration-200 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-600 mb-1">{card.title}</p>
                    <p className="text-lg sm:text-xl font-bold text-gray-900">
                      {card.isLoading ? (
                        <Skeleton height={24} width={80} />
                      ) : card.isError ? (
                        <span className="text-red-500 text-sm">Error</span>
                      ) : (
                        card.value
                      )}
                    </p>
                    <p className="text-xs text-gray-500">{card.subtitle}</p>
                  </div>
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 ${card.bg} rounded-lg flex items-center justify-center flex-shrink-0 ml-2`}>
                    <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${card.text}`} fill="currentColor" viewBox="0 0 24 24"><path d={card.icon} /></svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <h2 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4">Generate New Report</h2>
          
          {/* Success Message */}
          {generateSuccess && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
              {generateSuccess}
            </div>
          )}
          
          {/* Error Message */}
          {generateError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {generateError}
            </div>
          )}
          
          <div className="flex flex-col lg:flex-row lg:items-end space-y-3 lg:space-y-0 lg:space-x-3">
            <div className="flex-1 w-full lg:w-auto">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Report Type</label>
              <CustomDropdown options={reportTypes} value={reportType} onChange={setReportType} placeholder="Select report type" />
            </div>
            <div className="flex-1 w-full lg:w-auto">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Month</label>
              <CustomDropdown options={months} value={selectedMonth} onChange={setSelectedMonth} placeholder="Select month" />
            </div>
            <div className="w-full lg:w-auto">
              <button onClick={handleGenerateReport} disabled={isGenerating} className="w-full lg:w-auto bg-[#FFC11E] text-black px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-[#E6B800] focus:outline-none focus:ring-2 focus:ring-[#FFC11E] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1.5 transition-colors text-xs sm:text-sm cursor-pointer">
                <DownloadIcon />
                <span>{isGenerating ? 'Generating...' : 'Generate Report'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 lg:mb-0">Previous Reports</h2>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-3">
              <button 
                onClick={clearFilters}
                className="w-full sm:w-auto px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
              <select 
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  // Refresh data when type filter changes
                  fetchReportsList(1, 10);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-auto px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-black focus:border-black appearance-none bg-white text-black cursor-pointer"
              >
                <option value="">All Report Types</option>
                {reportTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
              <select 
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="w-full sm:w-auto px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-black focus:border-black appearance-none bg-white text-black cursor-pointer"
              >
                <option value="">All Periods</option>
                {months.map(month => <option key={month} value={month}>{month}</option>)}
              </select>
              <select 
                value={sortFilter}
                onChange={(e) => setSortFilter(e.target.value)}
                className="w-full sm:w-auto px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-black focus:border-black appearance-none bg-white text-black cursor-pointer"
              >
                <option value="newest">Sort by: Newest First</option>
                <option value="oldest">Sort by: Oldest First</option>
                <option value="name">Sort by: Report Name</option>
                <option value="period">Sort by: Period</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-gray-50">
                <tr>
                  {['report', 'period', 'generated', 'actions'].map((col, i) => (
                    <th 
                      key={col}
                      className="px-4 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => col !== 'actions' && handleSort(col)}
                    >
                      <div className="flex items-center space-x-1">
                        <span className="hidden sm:inline">{['Report', 'Period', 'Generated', 'Actions'][i]}</span>
                        <span className="sm:hidden">{['Report', 'Period', 'Date', 'Actions'][i]}</span>
                        {col !== 'actions' && <SortIcon column={col} />}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {listLoading ? (
                  <>
                    {[...Array(5)].map((_, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <Skeleton height={16} width="60%" />
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <Skeleton height={16} width="40%" />
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <Skeleton height={16} width="30%" />
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <Skeleton height={16} width="20%" />
                        </td>
                      </tr>
                    ))}
                  </>
                ) : listError ? (
                  <tr>
                    <td colSpan={4} className="px-4 sm:px-6 py-8 text-center">
                      <div className="text-center">
                        <div className="text-red-500 text-sm mb-2">{listError}</div>
                        <button 
                          onClick={() => fetchReportsList(currentPage, 10)}
                          className="text-xs bg-[#FFC11E] text-black px-3 py-1 rounded hover:bg-[#E6A91A] transition-colors"
                        >
                          Retry
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : filteredAndSortedReports.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 sm:px-6 py-8 text-center">
                      <div className="text-center">
                        <div className="text-gray-400 text-2xl mb-2">📊</div>
                        <p className="text-sm text-gray-500">No reports found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm font-medium text-gray-900">{report.report}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm text-gray-900">{report.period}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm text-gray-900">{new Date(report.generated).toLocaleDateString()}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <button 
                          onClick={() => handleDownloadReport(report.id, report.report)}
                          disabled={downloadingReports.has(report.id)}
                          className="text-xs sm:text-sm text-[#FFC11E] hover:text-[#E6B800] font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                        >
                          {downloadingReports.has(report.id) ? (
                            <>
                              <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Downloading...</span>
                            </>
                          ) : (
                            <>
                              <DownloadIcon />
                              <span>{report.actions}</span>
                            </>
                          )}
                      </button>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Download Error Display */}
          {downloadError && (
            <div className="px-4 sm:px-6 py-3 bg-red-50 border-t border-red-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="h-4 w-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-red-700">{downloadError}</span>
                </div>
                <button 
                  onClick={() => setDownloadError(null)}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          
          {/* Pagination */}
          <div className="px-4 sm:px-6 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
              <p className="text-xs sm:text-sm text-gray-700">
                Showing <span className="font-medium">{filteredAndSortedReports.length}</span> of <span className="font-medium">{totalReports}</span> reports
              </p>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <button className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                  Previous
                </button>
                <span className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-[#FFC11E] text-black rounded">1</span>
                <button className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
