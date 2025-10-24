import React, { useState, useEffect, useRef } from 'react';
import { Modal, Input, Button } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { getActiveRides, handleApiError } from '../apis/user/api';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// Active ride interface (matching API response)
interface ActiveRide {
  id: number;
  riderId?: number;
  creatorId?: number;
  driverName: string;
  driverEmail: string;
  passengerName?: string;
  passengerEmail?: string;
  role: 'Driver' | 'Passenger';
  status: 'Active' | 'STARTED';
  currentTime: string;
  speed: number;
  batteryLevel: number;
  location?: string;
  startLat?: number;
  startLong?: number;
  destLat?: number;
  destLong?: number;
}


interface TrackEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmployeeSelect: (rideId: number, riderId: number, employeeName: string) => void;
}

const TrackEmployeeModal = ({
  isOpen,
  onClose,
  onEmployeeSelect
}: TrackEmployeeModalProps) => {
  // State for active rides data
  const [activeRides, setActiveRides] = useState<ActiveRide[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  // Ref to prevent duplicate API calls
  const ridesFetched = useRef(false);

  // Fetch active rides from API
  const fetchActiveRides = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getActiveRides();
      setActiveRides(response.data);
    } catch (error) {
      console.error('Failed to fetch active rides:', error);
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when modal opens
  useEffect(() => {
    if (isOpen && !ridesFetched.current) {
      fetchActiveRides();
      ridesFetched.current = true;
    }
    
    // Reset flag when modal closes
    if (!isOpen) {
      ridesFetched.current = false;
    }
  }, [isOpen]);

  // Auto-refresh every 30 seconds when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setRefreshing(true);
      fetchActiveRides().finally(() => setRefreshing(false));
    }, 30000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const handleCancel = () => {
    onClose();
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleSearch = () => {
    setSearchTerm(searchInput);
  };

  // Convert active rides to employee format for display
  const employees = activeRides.map(ride => ({
    id: ride.id.toString(),
    name: ride.role === 'Driver' ? ride.driverName : (ride.passengerName || 'Unknown'),
    role: ride.role,
    status: ride.status === 'STARTED' ? 'Active' : ride.status,
    lastUpdate: ride.currentTime,
    speed: ride.speed,
    battery: ride.batteryLevel,
    rideId: ride.id, // Keep original ride ID for socket connection
    riderId: ride.riderId || ride.creatorId || ride.id // Use riderId or creatorId from API
  }));

  // Filter employees based on search term
  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal
      title={
        <div className="flex items-center space-x-1.5">
          <UserOutlined className="text-blue-600 text-sm" />
          <span className="text-base">Track Active Employees</span>
        </div>
      }
      open={isOpen}
      onCancel={handleCancel}
      footer={null}
      width={window.innerWidth < 640 ? '95%' : 600}
      destroyOnHidden
      className="track-employee-modal"
    >
      <div className="mt-3">
        {/* Search Bar */}
        <div className="mb-4">
          <div className="flex space-x-2">
            <Input
              placeholder="Search employees..."
              value={searchInput}
              onChange={handleSearchInputChange}
              onPressEnter={handleSearch}
              prefix={<SearchOutlined className="text-gray-400" />}
              size="middle"
              className="flex-1"
            />
            <Button
              type="primary"
              onClick={handleSearch}
              disabled={!searchInput.trim() || searchInput.trim() === searchTerm.trim()}
              size="middle"
              style={{ backgroundColor: '#FFC11E', borderColor: '#FFC11E', color: 'black' }}
            >
              Search
            </Button>
          </div>
        </div>

        {/* Employee List */}
        <div className="max-h-64 sm:max-h-96 overflow-y-auto">
          {loading ? (
            <div className="space-y-3 p-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
                  <div className="flex items-center space-x-3">
                    <Skeleton circle height={40} width={40} />
                    <div className="flex-1 space-y-2">
                      <Skeleton height={16} width="60%" />
                      <Skeleton height={14} width="40%" />
                      <div className="flex space-x-2">
                        <Skeleton height={12} width="20%" />
                        <Skeleton height={12} width="25%" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-6 sm:py-8">
              <div className="text-red-400 text-xl sm:text-2xl mb-2">⚠️</div>
              <p className="text-xs sm:text-sm text-red-500 mb-2">{error}</p>
              <Button 
                size="small" 
                onClick={fetchActiveRides}
                style={{ backgroundColor: '#FFC11E', borderColor: '#FFC11E', color: 'black' }}
              >
                Retry
              </Button>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <div className="text-gray-400 text-xl sm:text-2xl mb-2">👥</div>
              <p className="text-xs sm:text-sm text-gray-500">
                {searchTerm ? 'No employees found matching your search' : 'No active rides found'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {refreshing && (
                <div className="text-center py-2">
                  <div className="flex items-center justify-center text-xs text-gray-500">
                    <svg className="animate-spin h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Refreshing...
                  </div>
                </div>
              )}
              {filteredEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className="p-2 sm:p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => onEmployeeSelect(employee.rideId, employee.riderId, employee.name)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        employee.status === 'Active' ? 'bg-green-500' : 
                        employee.status === 'On Break' ? 'bg-yellow-500' : 'bg-gray-400'
                      }`}></div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <h3 className="text-xs sm:text-sm font-medium text-gray-900 truncate">{employee.name}</h3>
                          <span className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${
                            employee.status === 'Active' ? 'bg-green-100 text-green-800' : 
                            employee.status === 'On Break' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {employee.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{employee.role}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-xs text-gray-500">{employee.lastUpdate}</p>
                      {employee.speed && employee.battery && (
                        <div className="flex space-x-2 text-xs text-gray-400 mt-1">
                          <span>{employee.speed}km/h</span>
                          <span>•</span>
                          <span>{employee.battery}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">
              {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''} found
            </p>
            <Button
              onClick={handleCancel}
              size="middle"
              className="px-6 text-sm"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default TrackEmployeeModal;
