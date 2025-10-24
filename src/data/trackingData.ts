// Employee Tracking page data - Updated with only active employees

export interface EmployeeLocation {
  id: string;
  name: string;
  role: 'Driver' | 'Passenger';
  lat: number;
  lng: number;
  status: 'Active' | 'Inactive' | 'On Break';
  lastUpdate: string;
  color: string;
}

export const employeeLocations: EmployeeLocation[] = [
  {
    id: '1',
    name: 'John Smith',
    role: 'Driver',
    lat: 40.7128,
    lng: -74.0060,
    status: 'Active',
    lastUpdate: '2 min ago',
    color: 'bg-green-500'
  },
  {
    id: '2',
    name: 'Mike Chen',
    role: 'Driver',
    lat: 40.7505,
    lng: -73.9934,
    status: 'Active',
    lastUpdate: '1 min ago',
    color: 'bg-blue-500'
  },
  {
    id: '3',
    name: 'Alex Rodriguez',
    role: 'Driver',
    lat: 40.7831,
    lng: -73.9712,
    status: 'Active',
    lastUpdate: '30 sec ago',
    color: 'bg-green-500'
  },
  {
    id: '4',
    name: 'Lisa Park',
    role: 'Driver',
    lat: 40.6892,
    lng: -74.0445,
    status: 'Active',
    lastUpdate: '1 min ago',
    color: 'bg-blue-500'
  },
  {
    id: '5',
    name: 'James Brown',
    role: 'Passenger',
    lat: 40.7505,
    lng: -73.9934,
    status: 'Active',
    lastUpdate: '2 min ago',
    color: 'bg-indigo-500'
  },
  {
    id: '6',
    name: 'Maria Garcia',
    role: 'Driver',
    lat: 40.7614,
    lng: -73.9776,
    status: 'Active',
    lastUpdate: '45 sec ago',
    color: 'bg-emerald-500'
  },
  {
    id: '7',
    name: 'Jennifer Lee',
    role: 'Driver',
    lat: 40.7589,
    lng: -73.9851,
    status: 'Active',
    lastUpdate: '1 min ago',
    color: 'bg-cyan-500'
  },
  {
    id: '8',
    name: 'Michael Anderson',
    role: 'Driver',
    lat: 40.7128,
    lng: -74.0060,
    status: 'Active',
    lastUpdate: '2 min ago',
    color: 'bg-teal-500'
  },
  {
    id: '9',
    name: 'Sarah Wilson',
    role: 'Passenger',
    lat: 40.7282,
    lng: -73.7949,
    status: 'Active',
    lastUpdate: '3 min ago',
    color: 'bg-purple-500'
  },
  {
    id: '10',
    name: 'David Kim',
    role: 'Driver',
    lat: 40.7614,
    lng: -73.9776,
    status: 'Active',
    lastUpdate: '1 min ago',
    color: 'bg-orange-500'
  }
];

export const trackingMetrics = [
  {
    title: 'Active Rides',
    value: '0',
    icon: '🛣️',
    iconColor: 'text-blue-500'
  },
  {
    title: 'Avg Wait Time',
    value: '4.2 min',
    icon: '⏰',
    iconColor: 'text-yellow-500'
  },
  {
    title: "Today's Distance",
    value: '1,247 km',
    icon: '📍',
    iconColor: 'text-green-500'
  },
  {
    title: 'Safety Score',
    value: '98%',
    icon: '🛡️',
    iconColor: 'text-purple-500'
  }
];
