import { Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from './routeConstants';
import { Layout } from '../components/layout';
import DashboardPage from '../pages/DashboardPage';
import EmployeeManagementPage from '../pages/EmployeeManagementPage';
import EmployeeTrackingPage from '../pages/EmployeeTrackingPage';
import LeaderboardPage from '../pages/LeaderboardPage';
import ReportsPage from '../pages/ReportsPage';
import SettingsPage from '../pages/SettingsPage';

const ProtectedRoutes = () => {
  return (
    <Routes>
      <Route path={ROUTES.DASHBOARD} element={<Layout />}>
        <Route index element={<DashboardPage />} />
      </Route>
      <Route path={ROUTES.EMPLOYEES} element={<Layout />}>
        <Route index element={<EmployeeManagementPage />} />
      </Route>
      <Route path={ROUTES.EMPLOYEE_TRACKING} element={<Layout />}>
        <Route index element={<EmployeeTrackingPage />} />
      </Route>
      <Route path={ROUTES.LEADERBOARD} element={<Layout />}>
        <Route index element={<LeaderboardPage />} />
      </Route>
      <Route path={ROUTES.REPORTS} element={<Layout />}>
        <Route index element={<ReportsPage />} />
      </Route>
      <Route path={ROUTES.SETTINGS} element={<Layout />}>
        <Route index element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
    </Routes>
  );
};

export default ProtectedRoutes;
