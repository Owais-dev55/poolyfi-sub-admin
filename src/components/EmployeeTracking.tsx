import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import TrackEmployeeModal from './TrackEmployeeModal';
import type { EmployeeLocation } from '../data/trackingData';
import socketService from '../services/socketService';

interface Employee extends EmployeeLocation {
  speed?: number;
  direction?: string;
  battery?: number;
}

// Google Maps API key
const GOOGLE_MAPS_API_KEY = 'AIzaSyDvog6BMI8O8OXfseD3HV5x-X2Q8uo2ytU';

// Simplified icons
const Icon = ({ className, children }: { className: string; children: React.ReactNode }) => (
  <div className={className}>{children}</div>
);

// Google Maps component
const MapComponent = ({ 
  employees, 
  selectedEmployee, 
  onEmployeeSelect,
  mapRef
}: { 
  employees: Employee[];
  selectedEmployee: string | null;
  onEmployeeSelect: (id: string | null) => void;
  mapRef: React.RefObject<any>;
}) => {
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);

  const mapCallbackRef = useCallback((node: HTMLDivElement) => {
    if (node !== null && map === null && window.google) {
      console.log('Creating Google Map for mobile/tablet');
      const newMap = new window.google.maps.Map(node, {
        center: { lat: 24.8607, lng: 67.0011 }, // Karachi, Pakistan
        zoom: 10, // Reduced zoom by 20% (was 12, now 10)
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });
      setMap(newMap);
      if (mapRef.current) {
        mapRef.current = newMap;
      }
    }
  }, [map, mapRef]);

  // Create custom markers for employees
  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));

    // Only show marker for selected employee
    const employeesToShow = selectedEmployee 
      ? employees.filter(emp => emp.id === selectedEmployee)
      : [];

    const newMarkers = employeesToShow.map(employee => {
      const statusIcon = employee.status === 'Active' ? '🟢' : 
                        employee.status === 'On Break' ? '🟡' : '⚫';
      
      const marker = new window.google.maps.Marker({
        position: { lat: employee.lat, lng: employee.lng },
        map: map,
        title: `${employee.name} - ${employee.role}`,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 15,
          fillColor: employee.color.replace('bg-', '').replace('-500', ''),
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
        label: {
          text: statusIcon,
          fontSize: '12px',
          color: '#000000'
        }
      });

      // Add click listener
      marker.addListener('click', () => {
        onEmployeeSelect(selectedEmployee === employee.id ? null : employee.id);
      });

      // Add info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${employee.name}</h3>
            <p style="margin: 0 0 4px 0; color: #666; font-size: 14px;">${employee.role}</p>
            <p style="margin: 0 0 4px 0; font-size: 14px;">
              Status: <span style="color: ${employee.status === 'Active' ? '#10b981' : 
                                      employee.status === 'On Break' ? '#f59e0b' : '#6b7280'}; font-weight: 500;">
                ${employee.status}
              </span>
            </p>
            <p style="margin: 0 0 4px 0; color: #666; font-size: 12px;">Last update: ${employee.lastUpdate}</p>
            ${employee.speed ? `<p style="margin: 0 0 4px 0; color: #666; font-size: 12px;">Speed: ${employee.speed} km/h</p>` : ''}
            ${employee.battery ? `<p style="margin: 0 0 4px 0; color: #666; font-size: 12px;">Battery: ${employee.battery}%</p>` : ''}
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
        onEmployeeSelect(selectedEmployee === employee.id ? null : employee.id);
      });

      return marker;
    });

    setMarkers(newMarkers);

    // Fit bounds to show selected employee or center on NYC if none selected
    if (employeesToShow.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      employeesToShow.forEach(emp => bounds.extend({ lat: emp.lat, lng: emp.lng }));
      map.fitBounds(bounds);
    } else if (!selectedEmployee) {
      // Center on Karachi when no employee is selected
      map.setCenter({ lat: 24.8607, lng: 67.0011 });
      map.setZoom(10);
    }
  }, [map, employees, selectedEmployee, onEmployeeSelect]);

  return <div ref={mapCallbackRef} style={{ height: '100%', width: '100%' }} />;
};

// Loading component
const MapLoading = () => (
  <div className="flex items-center justify-center h-full bg-gray-100">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
      <p className="text-gray-600 text-sm">Loading map...</p>
      <p className="text-gray-500 text-xs mt-1">Please wait...</p>
    </div>
  </div>
);

// Error component
const MapError = () => (
  <div className="flex items-center justify-center h-full bg-red-50">
    <div className="text-center p-4">
      <div className="text-red-600 text-4xl mb-2">⚠️</div>
      <p className="text-red-600 text-sm font-medium">Failed to load map</p>
      <p className="text-red-500 text-xs mt-1">Check your internet connection</p>
      <div className="mt-4 p-3 bg-white rounded border">
        <p className="text-xs text-gray-600">API Key: {GOOGLE_MAPS_API_KEY.substring(0, 10)}...</p>
      </div>
    </div>
  </div>
);

const EmployeeTracking = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [isLiveTracking] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Socket and ride tracking state
  const [currentRide, setCurrentRide] = useState<{
    rideId: number;
    riderId: number;
    employeeName: string;
  } | null>(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [socketError, setSocketError] = useState<string | null>(null);
  const [isTestMode, setIsTestMode] = useState(false);
  
  // Refs for cleanup
  const mapRef = useRef<any>(null);
  const testIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize socket connection
  useEffect(() => {
    const initializeSocket = async () => {
      try {
        await socketService.connect();
        setIsSocketConnected(true);
        setSocketError(null);
        
        // Set up event listeners
        setupSocketEventListeners();
        
        console.log('Socket connected successfully');
      } catch (error) {
        console.error('Failed to connect to socket:', error);
        setSocketError('Failed to connect to tracking server');
        setIsSocketConnected(false);
      }
    };

    initializeSocket();

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
      setIsSocketConnected(false);
      stopTestMode();
    };
  }, []);

  // Cleanup test interval on unmount
  useEffect(() => {
    return () => {
      if (testIntervalRef.current) {
        clearInterval(testIntervalRef.current);
      }
    };
  }, []);

  // Set up socket event listeners
  const setupSocketEventListeners = () => {
    // Listen for room join confirmation
    socketService.on('roomAdded', (data) => {
      console.log('✅ Successfully joined ride room:', data);
      setSocketError(null);
    });

    // Listen for real-time location updates (main event)
    socketService.on('updatePassengers', (data) => {
      console.log('📍 Received location update:', data);
      handleLocationUpdate(data);
    });

    // Listen for room leave confirmation
    socketService.on('roomLeft', (data) => {
      console.log('👋 Left ride room:', data);
      setCurrentRide(null);
    });

    // Listen for errors
    socketService.on('error', (data) => {
      console.error('❌ Socket error:', data);
      setSocketError(data.message || 'Socket error occurred');
    });
  };

  // Handle location updates from socket
  const handleLocationUpdate = (data: { lat: string | number; long?: string | number; lng?: string | number; rideId?: number; userId?: number; speed?: number }) => {
    if (!currentRide || (data.rideId && data.rideId !== currentRide.rideId)) {
      console.log('⚠️ Ignoring update for different ride:', data.rideId, 'tracking:', currentRide?.rideId);
      return; // Not tracking this ride
    }

    // Skip placeholder coordinates
    if (data.lat === 'lat' || data.long === 'long' || data.lat === 'long') {
      console.log('⚠️ Received placeholder coordinates, waiting for real data...');
      return;
    }

    // Parse coordinates - handle both long/lng
    const lat = typeof data.lat === 'string' ? parseFloat(data.lat) : data.lat;
    const lng = typeof data.long === 'string' ? parseFloat(data.long) : 
                typeof data.lng === 'string' ? parseFloat(data.lng) :
                (data.long || data.lng || 0);

    if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) {
      console.error('❌ Invalid coordinates received:', data);
      return;
    }

    console.log(`✅ Updating location to: ${lat}, ${lng} (speed: ${data.speed || 'N/A'} km/h)`);

    // Update employee location
    setEmployees(prevEmployees => {
      const updated = prevEmployees.map(emp => {
        if (emp.id === selectedEmployee) {
          return {
            ...emp,
            lat,
            lng,
            lastUpdate: new Date().toLocaleTimeString(),
            speed: data.speed || emp.speed,
            battery: emp.battery // Keep existing battery if not provided
          };
        }
        return emp;
      });
      return updated;
    });

    // Move map to new location with smooth animation
    if (mapRef.current) {
      mapRef.current.panTo({ lat, lng });
      console.log('🗺️ Map centered to new location');
    }
  };

  // Test mode: Simulate location updates with static data
  const startTestMode = () => {
    if (!currentRide) return;
    
    setIsTestMode(true);
    console.log('Starting test mode with static Karachi locations');
    
    // Karachi area coordinates for testing
    const karachiLocations = [
      { lat: 24.8607, lng: 67.0011 }, // Karachi city center
      { lat: 24.8949, lng: 67.0300 }, // Clifton
      { lat: 24.8411, lng: 66.9978 }, // Saddar
      { lat: 24.8790, lng: 67.0400 }, // Defence
      { lat: 24.8300, lng: 67.0200 }, // Gulshan
      { lat: 24.9100, lng: 67.0500 }, // North Karachi
    ];
    
    let locationIndex = 0;
    
    testIntervalRef.current = setInterval(() => {
      const location = karachiLocations[locationIndex % karachiLocations.length];
      locationIndex++;
      
      // Simulate socket location update
      const mockData = {
        lat: location.lat.toString(),
        long: location.lng.toString(),
        rideId: currentRide.rideId,
        userId: currentRide.riderId
      };
      
      console.log('Test mode: Simulating location update:', mockData);
      handleLocationUpdate(mockData);
    }, 3000); // Update every 3 seconds
  };

  const stopTestMode = () => {
    if (testIntervalRef.current) {
      clearInterval(testIntervalRef.current);
      testIntervalRef.current = null;
    }
    setIsTestMode(false);
    console.log('Test mode stopped');
  };

  // Load initial employee data
  useEffect(() => {
    import('../data/trackingData').then(({ employeeLocations }) => {
      setEmployees(employeeLocations.map(emp => ({
        ...emp,
        speed: Math.floor(Math.random() * 60) + 20,
        direction: ['North', 'South', 'East', 'West'][Math.floor(Math.random() * 4)],
        battery: Math.floor(Math.random() * 30) + 70
      })));
    });
  }, []);


  // Simulate real-time updates
  useEffect(() => {
    if (!isLiveTracking) return;

    const interval = setInterval(() => {
      setEmployees(prevEmployees => 
        prevEmployees.map(emp => ({
          ...emp,
          lastUpdate: new Date().toLocaleTimeString(),
          speed: Math.floor(Math.random() * 60) + 20,
          direction: ['North', 'South', 'East', 'West'][Math.floor(Math.random() * 4)],
          battery: Math.floor(Math.random() * 30) + 70,
          // Simulate slight movement
          lat: emp.lat + (Math.random() - 0.5) * 0.001,
          lng: emp.lng + (Math.random() - 0.5) * 0.001
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [isLiveTracking]);


  const render = (status: Status) => {
    console.log('Map render status:', status);
    switch (status) {
      case Status.LOADING:
        return <MapLoading />;
      case Status.FAILURE:
        return <MapError />;
      case Status.SUCCESS:
        return (
          <MapComponent 
            employees={employees}
            selectedEmployee={selectedEmployee}
            onEmployeeSelect={setSelectedEmployee}
            mapRef={mapRef}
          />
        );
    }
  };

  // Handle employee selection from modal
  const handleEmployeeSelect = useCallback((rideId: number, riderId: number, employeeName: string) => {
    console.log(`🎯 Selected ride ${rideId} for employee ${employeeName} (riderId: ${riderId})`);
    
    // Stop tracking current ride if any
    if (currentRide && isSocketConnected) {
      console.log('🔄 Stopping current ride before starting new one...');
      socketService.leaveRideRoom(currentRide.rideId, currentRide.riderId);
    }
    
    // Set current ride
    setCurrentRide({ rideId, riderId, employeeName });
    setSelectedEmployee(rideId.toString());
    setIsModalOpen(false);
    
    // Create or update employee marker
    setEmployees(prevEmployees => {
      const existingEmployee = prevEmployees.find(emp => emp.id === rideId.toString());
      
      if (existingEmployee) {
        return prevEmployees;
      }
      
      // Add new employee marker at default Karachi location
      const newEmployee: Employee = {
        id: rideId.toString(),
        name: employeeName,
        role: 'Driver', // Default, will be updated from API
        status: 'Active',
        lat: 24.8607,
        lng: 67.0011,
        color: 'bg-blue-500',
        lastUpdate: new Date().toLocaleTimeString(),
        speed: 0,
        battery: 100
      };
      
      return [...prevEmployees, newEmployee];
    });
    
    if (!isSocketConnected) {
      console.error('❌ Socket not connected. Cannot join ride room.');
      setSocketError('Socket disconnected - cannot track in real-time');
      return;
    }
    
    // Join the ride room via socket (use riderId as userId)
    console.log(`🔌 Joining ride room ${rideId} for rider ${riderId}`);
    socketService.joinRideRoom(rideId, riderId, 'admin');
    
    console.log('✅ Ride tracking started. Waiting for location updates...');
  }, [isSocketConnected, currentRide]);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // Stop tracking current ride
  const stopTracking = useCallback(() => {
    if (currentRide && isSocketConnected) {
      console.log(`🛑 Stopping tracking for ride ${currentRide.rideId}`);
      socketService.leaveRideRoom(currentRide.rideId, currentRide.riderId);
    }
    
    // Stop test mode if running
    stopTestMode();
    
    setCurrentRide(null);
    setSelectedEmployee(null);
    setSocketError(null);
    
    console.log('✅ Tracking stopped');
  }, [currentRide, isSocketConnected]);

  return (
    <div className="flex-1 min-h-screen">
      {/* Metrics Cards */}
      <div className="px-4 py-4 sm:py-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Active Rides', value: '0', subtext: 'Live Status', color: 'text-blue-500' },
            { label: 'Avg Wait Time', value: '4.2 min', subtext: 'Excellent', color: 'text-yellow-500' },
            { label: "Today's Distance", value: '1,247 km', subtext: '+12% from yesterday', color: 'text-green-500' },
            { label: 'Safety Score', value: '98%', subtext: 'Outstanding', color: 'text-purple-500' }
          ].map((metric, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-3 sm:p-4">
            <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">{metric.label}</p>
                  <p className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{metric.value}</p>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">{metric.subtext}</p>
              </div>
                <Icon className={`${metric.color} text-xl sm:text-2xl flex-shrink-0 ml-2`}>●</Icon>
              </div>
            </div>
          ))}
            </div>
      </div>


      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-4 px-4 pb-4">
        {/* Google Map */}
        <div className="flex-1 min-w-0 h-[300px] sm:h-[400px] lg:h-[500px]">
          <div className="bg-white rounded-lg shadow-sm border border-gray-300 h-full relative overflow-hidden">
            {/* Fallback Map Interface */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
              <div className="text-center text-gray-700">
                <div className="text-4xl mb-4">🗺️</div>
                <h3 className="text-lg font-semibold mb-2">Employee Tracking Map</h3>
                <p className="text-sm mb-4">Interactive map view - Karachi, Pakistan</p>
                <div className="bg-white rounded-lg p-4 shadow-lg max-w-xs">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Active Employees</span>
              </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">On Break</span>
              </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <span className="text-sm">Offline</span>
            </div>
          </div>
        </div>
      </div>

            {/* Google Maps Wrapper */}
            <div className="absolute inset-0 w-full h-full z-10">
              <Wrapper 
                apiKey={GOOGLE_MAPS_API_KEY} 
                render={render}
                libraries={['places']}
              />
                </div>
              </div>
            </div>

        {/* Status Panel */}
        <div className="w-full lg:w-80 h-[250px] sm:h-[300px] lg:h-[500px]">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
            {/* Socket Connection Status */}
            <div className="p-3 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600">Connection Status</span>
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${isSocketConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-xs text-gray-500">
                    {isSocketConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>
              {socketError && (
                <div className="mt-1">
                  <span className="text-xs text-red-500">{socketError}</span>
                </div>
              )}
              {currentRide && (
                <div className="mt-2 space-y-1">
                  <span className="text-xs text-blue-600 block">
                    Tracking: {currentRide.employeeName} (Ride #{currentRide.rideId})
                  </span>
                  {isTestMode && (
                    <div className="flex items-center justify-between bg-green-50 p-1.5 rounded">
                      <span className="text-xs text-green-600 font-medium">
                        🧪 Test Mode Active
                      </span>
                      <button
                        onClick={stopTestMode}
                        className="text-xs text-green-700 hover:text-green-900 font-medium"
                      >
                        Stop
                      </button>
                    </div>
                  )}
                  {!isTestMode && currentRide && (
                    <button
                      onClick={startTestMode}
                      className="text-xs text-gray-600 hover:text-gray-800 underline"
                    >
                      Enable Test Mode
                    </button>
                  )}
                </div>
              )}
            </div>

            {selectedEmployee ? (
              <>
                <div className="p-3 sm:p-4 flex-1">
                  {(() => {
                    const employee = employees.find(emp => emp.id === selectedEmployee);
                    if (!employee) return null;
                      
                      return (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">{employee.name}</h3>
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ml-2 ${
                            employee.status === 'Active' ? 'bg-green-500' : 
                            employee.status === 'On Break' ? 'bg-yellow-500' : 'bg-gray-400'
                          }`}></div>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <p className="text-xs text-gray-600">Role</p>
                            <p className="text-sm font-medium">{employee.role}</p>
            </div>

                          <div>
                            <p className="text-xs text-gray-600">Status</p>
                            <p className={`text-sm font-medium ${
                              employee.status === 'Active' ? 'text-green-600' : 
                              employee.status === 'On Break' ? 'text-yellow-600' : 'text-gray-600'
                            }`}>
                              {employee.status}
                            </p>
                      </div>
                      
                          <div>
                            <p className="text-xs text-gray-600">Last Update</p>
                            <p className="text-sm font-medium">{employee.lastUpdate}</p>
                    </div>

                          {employee.speed && (
                            <div>
                              <p className="text-xs text-gray-600">Speed</p>
                              <p className="text-sm font-medium">{employee.speed} km/h</p>
                    </div>
                          )}
                          
                          {employee.battery && (
                            <div>
                              <p className="text-xs text-gray-600">Battery</p>
                              <p className="text-sm font-medium">{employee.battery}%</p>
                        </div>
                          )}
                          
                          <div>
                            <p className="text-xs text-gray-600">Location</p>
                            <p className="text-xs font-medium text-gray-500">{employee.lat.toFixed(4)}, {employee.lng.toFixed(4)}</p>
                  </div>
                            </div>
                      </div>
                    );
                  })()}
                          </div>

                {/* Close Button at Bottom */}
                <div className="p-3 sm:p-4 border-t border-gray-200">
                  <button 
                    onClick={stopTracking}
                    className="w-full bg-black text-yellow-400 py-2 px-3 rounded hover:bg-gray-800 transition-colors text-xs sm:text-sm font-medium cursor-pointer"
                  >
                    Stop Tracking
                  </button>
                </div>
              </>
            ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4 sm:p-6">
                <Icon className="text-gray-600 mb-3 sm:mb-4 text-xl sm:text-2xl">📍</Icon>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 px-2">
                  {employees.length > 0 ? 'Click on a marker to view details' : 'No employees being tracked'}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 max-w-xs px-2">
                  {employees.length > 0 
                    ? 'Select an employee marker on the map to see their details here'
                    : 'Employees will appear here when they start their shifts'
                  }
                </p>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  disabled={!isSocketConnected}
                  className={`py-2 px-4 rounded-lg transition-colors text-xs sm:text-sm font-medium w-full max-w-xs ${
                    isSocketConnected 
                      ? 'text-black cursor-pointer' 
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                  style={{ 
                    backgroundColor: isSocketConnected ? '#FFC11E' : '#E5E7EB',
                    borderColor: isSocketConnected ? '#FFC11E' : '#E5E7EB'
                  }}
                  onMouseEnter={(e) => {
                    if (isSocketConnected) {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#E6A91A';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isSocketConnected) {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#FFC11E';
                    }
                  }}
                >
                  {isSocketConnected ? 'Track Ride' : 'Connecting...'}
              </button>
            </div>
            )}
          </div>
        </div>
      </div>

      {/* Track Employee Modal */}
      <TrackEmployeeModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onEmployeeSelect={handleEmployeeSelect}
      />
    </div>
  );
};

export default EmployeeTracking;