import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { ROUTES } from '../../routes/routeConstants';

const Layout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();

  const handleItemClick = (_item: string) => {
    // Close mobile sidebar when navigating
    setIsMobileSidebarOpen(false);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case ROUTES.DASHBOARD:
        return 'Dashboard';
      case ROUTES.EMPLOYEES:
        return 'Employee Management';
      case ROUTES.EMPLOYEE_TRACKING:
        return 'Employee Tracking';
      case ROUTES.LEADERBOARD:
        return 'Leaderboard';
      case ROUTES.REPORTS:
        return 'Reports';
      case ROUTES.SETTINGS:
        return 'Settings';
      default:
        return 'Dashboard';
    }
  };

  const getActiveItem = () => {
    switch (location.pathname) {
      case ROUTES.DASHBOARD:
        return 'dashboard';
      case ROUTES.EMPLOYEES:
        return 'employees';
      case ROUTES.EMPLOYEE_TRACKING:
        return 'tracking';
      case ROUTES.LEADERBOARD:
        return 'leaderboard';
      case ROUTES.REPORTS:
        return 'reports';
      case ROUTES.SETTINGS:
        return 'settings';
      default:
        return 'dashboard';
    }
  };

  return (
    <div 
      className="flex h-screen"
      style={{
        background: 'linear-gradient(150deg,rgb(255, 242, 188) 30%, #f3f4f6)'
      }}
    >
      <Sidebar 
        activeItem={getActiveItem()} 
        onItemClick={handleItemClick}
        isMobileOpen={isMobileSidebarOpen}
        onMobileToggle={toggleMobileSidebar}
      />
      
    
      <div className="flex-1 flex flex-col min-w-0">
        
        <div className="bg-white shadow-sm border-b border-gray-200 px-3 lg:px-6 py-5 min-h-[70px] flex items-center">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-3">
              {/* Mobile/Tablet Hamburger Menu */}
              <button
                onClick={toggleMobileSidebar}
                className="lg:hidden p-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors rounded-lg"
                aria-label="Toggle sidebar"
              >
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 6h16M4 12h16M4 18h16" 
                  />
                </svg>
              </button>
              
              <h1 className="text-lg lg:text-xl font-display text-gray-900">{getPageTitle()}</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="text-right hidden sm:block">
                <div className="text-xs text-gray-500 font-body">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
