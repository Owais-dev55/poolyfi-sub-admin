import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES, ROUTE_LABELS, ROUTE_ICONS } from '../../routes/routeConstants';
import { useAuth } from '../../contexts/AuthContext';
import { getUserProfile } from '../../apis/user/api';
import { 
  DashboardIcon, 
  EmployeesIcon, 
  TrackingIcon, 
  LeaderboardIcon, 
  ReportsIcon, 
  SettingsIcon 
} from '../../data/icons/SidebarIcons';

interface SidebarProps {
  activeItem: string;
  onItemClick: (item: string) => void;
  isMobileOpen: boolean;
  onMobileToggle: () => void;
}

const Sidebar = ({ activeItem, onItemClick, isMobileOpen, onMobileToggle }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userEmail, setUserEmail] = useState('admin@poolyfi.com');
  const [userName, setUserName] = useState('Poolyfi');
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Function to get the appropriate icon component
  const getIconComponent = (iconKey: string) => {
    const iconProps = { className: "w-5 h-5" };
    switch (iconKey) {
      case 'dashboard': return <DashboardIcon {...iconProps} />;
      case 'employees': return <EmployeesIcon {...iconProps} />;
      case 'tracking': return <TrackingIcon {...iconProps} />;
      case 'leaderboard': return <LeaderboardIcon {...iconProps} />;
      case 'reports': return <ReportsIcon {...iconProps} />;
      case 'settings': return <SettingsIcon {...iconProps} />;
      default: return <DashboardIcon {...iconProps} />;
    }
  };

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await getUserProfile();
        setUserEmail(response.data.email);
        setUserName(response.data.name);
      } catch (error) {
        console.error('Failed to fetch user profile for sidebar:', error);
        // Keep default values if API fails
      }
    };

    fetchUserProfile();
  }, []);

  const menuItems = [
    { id: 'dashboard', label: ROUTE_LABELS[ROUTES.DASHBOARD], icon: ROUTE_ICONS[ROUTES.DASHBOARD], path: ROUTES.DASHBOARD },
    { id: 'employees', label: ROUTE_LABELS[ROUTES.EMPLOYEES], icon: ROUTE_ICONS[ROUTES.EMPLOYEES], path: ROUTES.EMPLOYEES },
    { id: 'tracking', label: ROUTE_LABELS[ROUTES.EMPLOYEE_TRACKING], icon: ROUTE_ICONS[ROUTES.EMPLOYEE_TRACKING], path: ROUTES.EMPLOYEE_TRACKING },
    { id: 'leaderboard', label: ROUTE_LABELS[ROUTES.LEADERBOARD], icon: ROUTE_ICONS[ROUTES.LEADERBOARD], path: ROUTES.LEADERBOARD },
    { id: 'reports', label: ROUTE_LABELS[ROUTES.REPORTS], icon: ROUTE_ICONS[ROUTES.REPORTS], path: ROUTES.REPORTS },
    { id: 'settings', label: ROUTE_LABELS[ROUTES.SETTINGS], icon: ROUTE_ICONS[ROUTES.SETTINGS], path: ROUTES.SETTINGS },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black opacity-50 z-40 lg:hidden"
          onClick={onMobileToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        bg-white text-black transition-all duration-300 ease-in-out min-h-screen flex flex-col z-50 border-r border-gray-300 shadow-lg
        ${isCollapsed ? 'w-12' : 'w-52'}
        ${isMobileOpen ? 'fixed inset-y-0 left-0' : 'hidden lg:flex'}
        ${isMobileOpen ? 'w-52' : ''}
      `}>
      
      {/* Header */}
      <div className={`border-b border-gray-200 transition-all duration-300 ${isCollapsed ? 'px-3 py-4' : 'px-6 py-4'} bg-white shadow-sm min-h-[70px] flex items-center`}>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img 
                src="/poolify-logo.png" 
                alt="Poolyfi Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex flex-col">
                <span className="text-lg font-display whitespace-nowrap text-black">Poolyfi</span>
                <span className="text-xs text-gray-600 font-caption -mb-1" style={{ fontSize: '10px' }}>Admin Dashboard</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Mobile Close Button */}
            {isMobileOpen && (
              <button
                onClick={onMobileToggle}
                className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 hover:text-black transition-all duration-200 rounded-lg cursor-pointer"
                title="Close sidebar"
              >
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            
            {/* Collapse Toggle - Hidden on mobile */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:block p-2 text-gray-600 hover:bg-gray-100 hover:text-black transition-all duration-200 rounded-lg cursor-pointer"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg 
                className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              onItemClick(item.id);
              navigate(item.path);
            }}
            className={`w-full flex items-center rounded-sm transition-all duration-200 cursor-pointer ${
              (isCollapsed && !isMobileOpen) ? 'justify-center px-2 py-2' : 'space-x-2 px-3 py-2'
            } ${
              activeItem === item.id
                ? 'bg-gray-100 text-gray-800 font-medium shadow-sm'
                : 'text-gray-600 hover:bg-gray-50 hover:text-black font-normal hover:shadow-sm'
            }`}
            title={isCollapsed ? item.label : undefined}
          >
            <span className="flex-shrink-0">{getIconComponent(item.icon)}</span>
            {(!isCollapsed || isMobileOpen) && <span className="font-caption whitespace-nowrap" style={{ fontSize: '13px' }}>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* User Info */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className={`flex items-center ${(isCollapsed && !isMobileOpen) ? 'justify-center' : 'space-x-2'}`}>
          <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
            <span className="text-xs font-bold text-white">P</span>
          </div>
          {(!isCollapsed || isMobileOpen) && (
            <div className="min-w-0">
              <div className="font-heading truncate text-black">{userName}</div>
              <div className="text-xs text-gray-600 truncate font-body">{userEmail}</div>
            </div>
          )}
        </div>
      </div>


      {/* Logout Button */}
      <div className="p-1 border-t border-gray-200 bg-white">
        <button
          onClick={async () => {
            await logout();
            navigate(ROUTES.LOGIN);
          }}
          className={`w-full flex items-center rounded-xl transition-all duration-200 text-gray-600 hover:bg-gray-50 hover:text-black font-caption cursor-pointer ${
            (isCollapsed && !isMobileOpen) ? 'justify-center px-2 py-2' : 'space-x-2 px-3 py-2'
          }`}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <span className="flex-shrink-0 text-sm">→</span>
          {(!isCollapsed || isMobileOpen) && <span className="whitespace-nowrap">Logout</span>}
        </button>
      </div>
      </div>
    </>
  );
};

export default Sidebar;
