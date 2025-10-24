// Centralized data exports - import specific items to avoid conflicts
export { 
  employeeDistributionData, 
  analyticsMetrics, 
  rideTrendsSummary 
} from './analyticsData';

export { 
  rideTrendsData, 
  employeePerformanceData, 
  rideTypesData, 
  monthlyRevenueData, 
  efficiencyData, 
  peakHoursData, 
  costAnalysisData, 
  routeEfficiencyData, 
  metrics 
} from './analyticsPageData';

export { 
  dashboardMetrics, 
  recentActivities, 
  quickActions, 
  ridesData, 
  employeePerformance, 
  monthlyTrends 
} from './dashboardData';

export { employees } from './leaderboardData';

// Export types separately
export type { Employee as LeaderboardEmployee } from './leaderboardData';
export type { Employee as EmployeeDataEmployee } from './employeeData';