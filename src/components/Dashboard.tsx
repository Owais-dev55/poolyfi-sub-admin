import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  dashboardMetrics,
  quickActions,
  ridesData,
  employeePerformance
} from '../data/dashboardData';
import AddEmployeeModal from './AddEmployeeModal';
import { getNotifications, getDashboardMeta, getRidesTrend, getRidersPerformance, handleApiError, getUserProfile } from '../apis/user/api';
import type { RidesTrendDataPoint, RiderPerformanceDataPoint, DashboardMetaData } from '../apis/user/api';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// Notification interface
interface NotificationItem {
  id: number;
  companyId: number;
  receiverId: number;
  token: string;
  msg: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}


const Dashboard = () => {
  const navigate = useNavigate();
  
  // Filter states for both charts
  const [ridesFilter, setRidesFilter] = useState('week');
  const [performanceFilter, setPerformanceFilter] = useState('week');
  
  // Modal state for Add Employee
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [notificationsError, setNotificationsError] = useState<string | null>(null);
  
  // Dashboard metadata state
  const [dashboardMeta, setDashboardMeta] = useState<DashboardMetaData>({
    activeEmployees: 0,
    activeRides: 0,
    monthlyRides: 0,
    oxygenSaved: '0 kgs'
  });
  const [metaLoading, setMetaLoading] = useState(true);
  const [metaError, setMetaError] = useState<string | null>(null);
  
  // Rides trend state
  const [ridesTrendData, setRidesTrendData] = useState<RidesTrendDataPoint[]>([]);
  const [ridesTrendLoading, setRidesTrendLoading] = useState(false);
  const [ridesTrendError, setRidesTrendError] = useState<string | null>(null);
  
  // Riders performance state
  const [ridersPerformanceData, setRidersPerformanceData] = useState<RiderPerformanceDataPoint[]>([]);
  const [ridersPerformanceLoading, setRidersPerformanceLoading] = useState(false);
  const [ridersPerformanceError, setRidersPerformanceError] = useState<string | null>(null);
  
  // State for user profile and companyId
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  
  // Refs to prevent multiple API calls
  const notificationsFetched = useRef(false);
  const metaFetched = useRef(false);
  const profileFetched = useRef(false);

  // Fetch user profile to get companyId on component mount
  useEffect(() => {
    // Prevent multiple calls
    if (profileFetched.current) {
      return;
    }

    const fetchUserProfile = async () => {
      try {
        profileFetched.current = true;
        setProfileLoading(true);
        setProfileError(null);
        const response = await getUserProfile();
        setCompanyId(response.data.companyId);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        setProfileError(handleApiError(error));
        // Reset the flag on error so it can be retried
        profileFetched.current = false;
      } finally {
        setProfileLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Fetch notifications on component mount
  useEffect(() => {
    // Prevent multiple calls
    if (notificationsFetched.current) {
      return;
    }

    const fetchNotifications = async () => {
      try {
        notificationsFetched.current = true;
        setNotificationsLoading(true);
        setNotificationsError(null);
        const response = await getNotifications(5, 1);
        setNotifications(response.data);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        setNotificationsError(handleApiError(error));
        // Reset the flag on error so it can be retried
        notificationsFetched.current = false;
      } finally {
        setNotificationsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Fetch dashboard metadata when companyId is available
  useEffect(() => {
    // Only fetch if we have a companyId and haven't fetched yet
    if (!companyId || metaFetched.current) {
      return;
    }

    const fetchDashboardMeta = async () => {
      try {
        metaFetched.current = true;
        setMetaLoading(true);
        setMetaError(null);
        const response = await getDashboardMeta(companyId);
        setDashboardMeta(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard metadata:', error);
        setMetaError(handleApiError(error));
        // Reset the flag on error so it can be retried
        metaFetched.current = false;
      } finally {
        setMetaLoading(false);
      }
    };

    fetchDashboardMeta();
  }, [companyId]);

  // Create dynamic metrics array with API data
  const dynamicMetrics = useMemo(() => {
    const baseMetrics = [...dashboardMetrics];
    
    // Update all cards with API data
    if (!profileLoading && !metaLoading && !profileError && !metaError) {
      baseMetrics[0].value = dashboardMeta.activeEmployees.toString();
      baseMetrics[1].value = dashboardMeta.activeRides.toString();
      baseMetrics[2].value = dashboardMeta.monthlyRides.toString();
      baseMetrics[3].value = dashboardMeta.oxygenSaved;
    }
    
    return baseMetrics;
  }, [dashboardMeta, profileLoading, metaLoading, profileError, metaError]);

  // Fetch rides trend data from API
  const fetchRidesTrendData = async (filter: string) => {
    try {
      setRidesTrendLoading(true);
      setRidesTrendError(null);
      
      // Map filter values to API values
      const apiFilter = filter === 'day' ? 'daily' : 
                       filter === 'week' ? 'weekly' : 
                       filter === 'month' ? 'monthly' : 'yearly';
      
      const response = await getRidesTrend(apiFilter as 'daily' | 'weekly' | 'monthly' | 'yearly');
      
      if (!response.hasError && response.data) {
        setRidesTrendData(response.data.data);
      } else {
        setRidesTrendError(response.message || 'Failed to fetch rides trend data');
      }
    } catch (error) {
      console.error('Failed to fetch rides trend data:', error);
      setRidesTrendError(handleApiError(error));
    } finally {
      setRidesTrendLoading(false);
    }
  };

  // Fetch riders performance data from API
  const fetchRidersPerformanceData = async (filter: string) => {
    try {
      setRidersPerformanceLoading(true);
      setRidersPerformanceError(null);
      
      // Map filter values to API values
      const apiFilter = filter === 'day' ? 'daily' : 
                       filter === 'week' ? 'weekly' : 
                       filter === 'month' ? 'monthly' : 'yearly';
      
      const response = await getRidersPerformance(apiFilter as 'daily' | 'weekly' | 'monthly' | 'yearly');
      
      if (!response.hasError && response.data) {
        setRidersPerformanceData(response.data.data);
      } else {
        setRidersPerformanceError(response.message || 'Failed to fetch riders performance data');
      }
    } catch (error) {
      console.error('Failed to fetch riders performance data:', error);
      setRidersPerformanceError(handleApiError(error));
    } finally {
      setRidersPerformanceLoading(false);
    }
  };

  // Generate fallback data for different time periods (used when API fails)
  const generateFallbackRidesData = (period: string) => {
    switch (period) {
      case 'day':
        return [
          { name: '12 AM', rides: 2 },
          { name: '3 AM', rides: 0 },
          { name: '6 AM', rides: 5 },
          { name: '9 AM', rides: 12 },
          { name: '12 PM', rides: 18 },
          { name: '3 PM', rides: 15 },
          { name: '6 PM', rides: 22 },
          { name: '9 PM', rides: 8 }
        ];
      case 'week':
        return ridesData; // Default weekly data
      case 'month':
        return [
          { name: 'Week 1', rides: 45 },
          { name: 'Week 2', rides: 52 },
          { name: 'Week 3', rides: 38 },
          { name: 'Week 4', rides: 61 }
        ];
      case 'year':
        return [
          { name: 'Jan', rides: 120 },
          { name: 'Feb', rides: 135 },
          { name: 'Mar', rides: 150 },
          { name: 'Apr', rides: 165 },
          { name: 'May', rides: 180 },
          { name: 'Jun', rides: 195 },
          { name: 'Jul', rides: 210 },
          { name: 'Aug', rides: 185 },
          { name: 'Sep', rides: 200 },
          { name: 'Oct', rides: 175 },
          { name: 'Nov', rides: 160 },
          { name: 'Dec', rides: 145 }
        ];
      default:
        return ridesData;
    }
  };

  // Generate fallback data for employee performance (used when API fails)
  const generateFallbackPerformanceData = (period: string) => {
    switch (period) {
      case 'day':
        return [
          { name: 'John', rides: 8, rating: 4.8 },
          { name: 'Sarah', rides: 6, rating: 4.9 },
          { name: 'Mike', rides: 7, rating: 4.7 },
          { name: 'Emily', rides: 5, rating: 4.6 },
          { name: 'David', rides: 9, rating: 4.8 }
        ];
      case 'week':
        return employeePerformance; // Default weekly data
      case 'month':
        return [
          { name: 'John', rides: 180, rating: 4.8 },
          { name: 'Sarah', rides: 165, rating: 4.9 },
          { name: 'Mike', rides: 175, rating: 4.7 },
          { name: 'Emily', rides: 155, rating: 4.6 },
          { name: 'David', rides: 190, rating: 4.8 }
        ];
      case 'year':
        return [
          { name: 'John', rides: 2100, rating: 4.8 },
          { name: 'Sarah', rides: 1950, rating: 4.9 },
          { name: 'Mike', rides: 2050, rating: 4.7 },
          { name: 'Emily', rides: 1850, rating: 4.6 },
          { name: 'David', rides: 2200, rating: 4.8 }
        ];
      default:
        return employeePerformance;
    }
  };

  // Fetch rides trend data when filter changes
  useEffect(() => {
    fetchRidesTrendData(ridesFilter);
  }, [ridesFilter]);

  // Fetch riders performance data when filter changes
  useEffect(() => {
    fetchRidersPerformanceData(performanceFilter);
  }, [performanceFilter]);

  // Memoized filtered data
  const filteredRidesData = useMemo(() => {
    // Use API data if available and no error, otherwise use fallback
    if (ridesTrendData.length > 0 && !ridesTrendError) {
      return ridesTrendData.map(item => ({
        name: item.label,
        rides: item.rides
      }));
    }
    return generateFallbackRidesData(ridesFilter);
  }, [ridesTrendData, ridesTrendError, ridesFilter]);
  
  const filteredPerformanceData = useMemo(() => {
    // Use API data if available and no error, otherwise use fallback
    if (ridersPerformanceData.length > 0 && !ridersPerformanceError) {
      return ridersPerformanceData.map(item => ({
        name: item.rider,
        rides: item.rides,
        rating: 4.8 // Default rating since API doesn't provide it
      }));
    }
    return generateFallbackPerformanceData(performanceFilter);
  }, [ridersPerformanceData, ridersPerformanceError, performanceFilter]);

  // Handler functions
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-employee':
        setIsAddEmployeeModalOpen(true);
        break;
      case 'leaderboard':
        navigate('/leaderboard');
        break;
      case 'live-tracking':
        navigate('/employee-tracking');
        break;
      case 'settings':
        navigate('/settings');
        break;
      default:
        break;
    }
  };

  const handleAddEmployee = (employeeData: any) => {
    // Here you would typically send the data to your API
    console.log('Adding employee:', employeeData);
    // Close modal
    setIsAddEmployeeModalOpen(false);
  };

  return (
    <div className="min-h-full">
      {/* Main Content */}
      <div className="p-5">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          {dynamicMetrics.map((metric, index) => (
             <div key={index} className={`${metric.title === 'Oxygen Save' ? 'bg-gradient-to-br from-yellow-500 to-yellow-300' : 'bg-white'} rounded-lg shadow-sm p-5 relative overflow-hidden`}>
              <div className="flex items-center justify-between">
                <div>
                   <p className={`text-xs font-caption mb-1 ${metric.title === 'Oxygen Save' ? 'text-yellow-100' : 'text-gray-600'}`}>{metric.title}</p>
                   <div className={`text-xl font-display ${metric.title === 'Oxygen Save' ? 'text-white' : 'text-gray-900'}`}>
                     {(profileLoading || metaLoading) && index < 4 ? (
                       <Skeleton height={24} width={60} baseColor={metric.title === 'Oxygen Save' ? '#fbbf24' : '#e5e7eb'} highlightColor={metric.title === 'Oxygen Save' ? '#f59e0b' : '#f3f4f6'} />
                     ) : (profileError || metaError) && index < 4 ? (
                       <span className="text-red-500 text-sm">Error</span>
                     ) : (
                       metric.value
                     )}
                   </div>
                   {/* <p className={`text-xs font-body ${metric.title === 'Oxygen Save' ? 'text-yellow-100' : (metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600')}`}>
                    {metric.change}
                  </p> */}
                </div>
                 <div className={`text-2xl ${metric.title === 'Oxygen Save' ? 'text-white relative z-10' : metric.iconColor}`}>
                  <metric.icon className="w-6 h-6" />
                </div>
              </div>
               {metric.title === 'Oxygen Save' && (
                 <div className="absolute -top-12 -right-12 w-32 h-32 bg-yellow-200 opacity-40 rounded-full"></div>
               )}
            </div>
          ))}
        </div>

        {/* Activity and Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          {/* Live Activity Feed */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.9559465,17 L16.8572173,9.21455489 C16.5341878,6.92561193 14.3163933,5 12,5 C9.68662535,5 7.4656614,6.92648519 7.14273575,9.21456958 L6.04394973,17 L17.9559465,17 Z M5.16236174,8.93507221 C5.62497658,5.65722234 8.69303423,3 12,3 C15.3137085,3 18.3754003,5.66003534 18.8375934,8.93507221 L19.978875,17.0220385 C20.1330409,18.1144365 19.3700367,19 18.2657828,19 L5.73409618,19 C4.63381562,19 3.86648583,18.1169798 4.02101887,17.0220385 L5.16236174,8.93507221 Z M15,20 C15,21.6568542 13.6568542,23 12,23 C10.3431458,23 9,21.6568542 9,20 L10.5,20 C10.5,20.8284271 11.1715729,21.5 12,21.5 C12.8284271,21.5 13.5,20.8284271 13.5,20 L15,20 Z" fillRule="nonzero" />
                  <circle cx="12" cy="3" r="2" />
                </svg>
              </div>
              <h3 className="text-lg font-heading text-gray-900">Notifications</h3>
            </div>
            <div className="space-y-5">
              {notificationsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg shadow-sm">
                      <Skeleton circle height={40} width={40} />
                      <div className="flex-1 space-y-2">
                        <Skeleton height={16} width="80%" />
                        <Skeleton height={14} width="60%" />
                        <Skeleton height={12} width="40%" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notificationsError ? (
                <div className="text-center py-4">
                  <p className="text-xs text-red-600">{notificationsError}</p>
                </div>
              ) : notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div key={notification.id} className="flex items-start space-x-3 group">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FFC11E] mt-1.5 flex-shrink-0 group-hover:scale-110 transition-transform duration-200"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-body text-gray-900 leading-relaxed group-hover:text-gray-700 transition-colors duration-200">
                        {notification.msg}
                      </p>
                      <p className="text-xs font-caption text-gray-500 mt-1">
                        {new Date(notification.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-xs text-gray-500">No notifications available</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-heading text-gray-900">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-2 gap-5">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.actionKey)}
                  className={`${action.color} p-3 rounded-xl flex flex-col items-center space-y-2 transition-all duration-200 shadow-sm hover:shadow-lg hover:-translate-y-1 group cursor-pointer`}
                >
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <action.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-caption font-medium">{action.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="space-y-5">

          {/* Rides Trend Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-5">
            <div className="bg-white rounded-lg shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-heading text-gray-900">Rides Trend</h3>
                <div className="flex items-center space-x-2">
                  <label className="text-xs font-caption text-gray-600">Filter:</label>
                  <select
                    value={ridesFilter}
                    onChange={(e) => setRidesFilter(e.target.value)}
                    className="text-xs border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                  >
                    <option value="day">Day</option>
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                    <option value="year">Year</option>
                  </select>
                </div>
              </div>
              <div className="cursor-pointer">
                {ridesTrendLoading ? (
                  <div className="flex items-center justify-center h-[240px]">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFCB44] mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600">Loading rides data...</p>
                    </div>
                  </div>
                ) : ridesTrendError ? (
                  <div className="flex items-center justify-center h-[240px]">
                    <div className="text-center">
                      <div className="text-red-500 text-xl mb-2">⚠️</div>
                      <p className="text-sm text-red-600 mb-2">{ridesTrendError}</p>
                      <button 
                        onClick={() => fetchRidesTrendData(ridesFilter)}
                        className="text-xs bg-[#FFCB44] text-black px-3 py-1 rounded hover:bg-[#E6A91A] transition-colors"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                ) : (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={filteredRidesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="rides" stroke="#FFCB44" strokeWidth={2} name="Rides" />
                </LineChart>
              </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>


          {/* Employee Performance Chart */}
          <div className="bg-white rounded-lg shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-heading text-gray-900">Employee Performance</h3>
              <div className="flex items-center space-x-2">
                <label className="text-xs font-caption text-gray-600">Filter:</label>
                <select
                  value={performanceFilter}
                  onChange={(e) => setPerformanceFilter(e.target.value)}
                  className="text-xs border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                >
                  <option value="day">Day</option>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                  <option value="year">Year</option>
                </select>
              </div>
            </div>
            <div className="cursor-pointer">
              {ridersPerformanceLoading ? (
                <div className="flex items-center justify-center h-[320px]">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFCB44] mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Loading performance data...</p>
                  </div>
                </div>
              ) : ridersPerformanceError ? (
                <div className="flex items-center justify-center h-[320px]">
                  <div className="text-center">
                    <div className="text-red-500 text-xl mb-2">⚠️</div>
                    <p className="text-sm text-red-600 mb-2">{ridersPerformanceError}</p>
                    <button 
                      onClick={() => fetchRidersPerformanceData(performanceFilter)}
                      className="text-xs bg-[#FFCB44] text-black px-3 py-1 rounded hover:bg-[#E6A91A] transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={filteredPerformanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="rides" fill="#FFCB44" name="Rides Completed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={isAddEmployeeModalOpen}
        onClose={() => setIsAddEmployeeModalOpen(false)}
        onAddEmployee={handleAddEmployee}
      />

    </div>
  );
};

export default Dashboard;

