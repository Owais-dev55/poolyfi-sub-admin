// Dashboard page data
import { UsersIcon, RefreshIcon, CalendarIcon, CashIcon, PlusIcon, LocationIcon, SettingsIcon, CheckIcon, XIcon } from '../components/icons/DashboardIcons';
import { LeaderboardIcon } from '../data/icons/SidebarIcons';

export const dashboardMetrics = [
  {
    title: 'Total Employees',
    value: '3',
    change: '+12% vs last month',
    changeType: 'positive',
    icon: UsersIcon,
    iconColor: 'text-blue-500'
  },
  {
    title: 'Active Rides',
    value: '0',
    change: '+5 vs yesterday',
    changeType: 'positive',
    icon: RefreshIcon,
    iconColor: 'text-green-500'
  },
  {
    title: 'Monthly Rides',
    value: '1',
    change: '+18% vs last month',
    changeType: 'positive',
    icon: CalendarIcon,
    iconColor: 'text-yellow-500'
  },
  {
    title: 'Oxygen Save',
    value: '45 Kgs',
    change: '+24% vs last month',
    changeType: 'positive',
    icon: CashIcon,
    iconColor: 'text-green-500'
  }
];

export const recentActivities = [
  {
    icon: CheckIcon,
    title: 'Company "RideShare Pro LLC" was verified',
    subtitle: '3 hours ago',
    iconColor: 'text-blue-500'
  },
  {
    icon: CalendarIcon,
    title: 'Session "Training Session 1" was scheduled',
    subtitle: '4 hours ago',
    iconColor: 'text-gray-500'
  },
  {
    icon: XIcon,
    title: 'Session "New Session 3" was cancelled',
    subtitle: '8 hours ago',
    iconColor: 'text-gray-500'
  },
  {
    icon: UsersIcon,
    title: 'New driver Sarah Johnson joined the platform',
    subtitle: '2 hours ago',
    iconColor: 'text-green-500'
  },
  {
    icon: UsersIcon,
    title: 'New driver Mike Chen joined the platform',
    subtitle: '4 hours ago',
    iconColor: 'text-green-500'
  },
  {
    icon: CheckIcon,
    title: 'Company "Test Company LLC" was verified',
    subtitle: '6 hours ago',
    iconColor: 'text-blue-500'
  }
];

export const quickActions = [
  { title: 'Add Employee', icon: PlusIcon, actionKey: 'add-employee', color: 'bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 hover:text-gray-900' },
  { title: 'Leaderboard', icon: LeaderboardIcon, actionKey: 'leaderboard', color: 'bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 hover:text-gray-900' },
  { title: 'Live Tracking', icon: LocationIcon, actionKey: 'live-tracking', color: 'bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 hover:text-gray-900' },
  { title: 'Settings', icon: SettingsIcon, actionKey: 'settings', color: 'bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 hover:text-gray-900' }
];

// Chart data
export const ridesData = [
  { name: 'Mon', rides: 12, revenue: 240 },
  { name: 'Tue', rides: 19, revenue: 380 },
  { name: 'Wed', rides: 15, revenue: 300 },
  { name: 'Thu', rides: 25, revenue: 500 },
  { name: 'Fri', rides: 22, revenue: 440 },
  { name: 'Sat', rides: 18, revenue: 360 },
  { name: 'Sun', rides: 14, revenue: 280 }
];

export const employeePerformance = [
  { name: 'John Smith', rides: 45, rating: 4.8 },
  { name: 'Sarah Johnson', rides: 38, rating: 4.9 },
  { name: 'Mike Chen', rides: 42, rating: 4.7 },
  { name: 'Emily Davis', rides: 35, rating: 4.6 },
  { name: 'David Wilson', rides: 40, rating: 4.8 }
];

export const rideTypesData = [
  { name: 'Business', value: 45, color: '#FFCB44' },
  { name: 'Personal', value: 30, color: '#10B981' },
  { name: 'Airport', value: 15, color: '#F59E0B' },
  { name: 'Other', value: 10, color: '#EF4444' }
];

export const monthlyTrends = [
  { month: 'Jan', rides: 120, cost: 2400 },
  { month: 'Feb', rides: 135, cost: 2200 },
  { month: 'Mar', rides: 150, cost: 2100 },
  { month: 'Apr', rides: 165, cost: 2000 },
  { month: 'May', rides: 180, cost: 1900 },
  { month: 'Jun', rides: 195, cost: 1850 }
];
