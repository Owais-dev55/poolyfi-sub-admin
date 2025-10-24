// User API endpoints and functions

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://62.72.24.4:3000/api';

// Admin login endpoint
export const ADMIN_LOGIN_ENDPOINT = 'admin_login';

export function getAdminLoginUrl(): string {
  const baseUrl = API_BASE_URL;
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${normalizedBaseUrl}/${ADMIN_LOGIN_ENDPOINT}`;
}

// Types for API requests and responses
export interface LoginRequest {
  email: string;
  password: string;
}

// User interface based on API response
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  password: string;
  departmentId: number | null;
  companyId: number;
  isDelete: boolean;
  isActive: boolean;
  isRider: boolean | null;
  empId?: string | null;
  createdAt: string;
  updatedAt: string;
}

// Get Users API response interface
export interface GetUsersResponse {
  data: User[];
  hasError: boolean;
  message: string;
  metaData: {
    totalPages: number;
    currentPage: number;
    nextPage: number | null;
    previousPage: number | null;
    totalItems: number;
  };
}

// Department interface based on API response
export interface Department {
  id: number;
  name: string;
  companyId: number;
  isActive: boolean;
  isDelete: boolean;
  createdAt: string;
  updatedAt: string;
}

// Get Departments API response interface
export interface GetDepartmentsResponse {
  data: Department[];
  hasError: boolean;
  message: string;
}

export interface LoginResponse {
  data: {
    user: {
      id: number;
      name: string;
      email: string;
      phone?: string;
      departmentId?: number;
      companyId: number;
      isDelete: boolean;
      isActive: boolean;
      isRider?: boolean;
      createdAt: string;
      updatedAt: string;
    };
    session: {
      id: number;
      userId: number;
      token: string;
      isExpired: boolean;
      createdAt: string;
      updatedAt: string;
    };
    accessToken: string;
  };
  hasError: boolean;
  message: string;
}

export interface ApiError {
  message: string;
  status?: number;
}

// Create User Request/Response interfaces
export interface CreateUserRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  departmentId?: number | null;
  isRider: boolean;
  empId?: string | null;
}

// Update User Request/Response interfaces
export interface UpdateUserRequest {
  name?: string;
  email?: string;
  phone?: string;
  departmentId?: number | null;
  isActive?: boolean;
  isDelete?: boolean;
  isRider?: boolean | null;
  empId?: string | null;
}

// Update User Status Request/Response interfaces
export interface UpdateUserStatusRequest {
  isActive: boolean;
}

export interface UpdateUserStatusResponse {
  data: {
    id: number;
    name: string;
    email: string;
    phone: string;
    password: string;
    departmentId: number | null;
    companyId: number;
    isDelete: boolean;
    isActive: boolean;
    isRider: boolean | null;
    createdAt: string;
    updatedAt: string;
  };
  hasError: boolean;
  message: string;
}

export interface UpdateUserResponse {
  data: {
    id: number;
    name: string;
    email: string;
    phone: string;
    password: string;
    departmentId: number | null;
    companyId: number | null;
    isDelete: boolean;
    isActive: boolean;
    isRider: boolean | null;
    createdAt: string;
    updatedAt: string;
  };
  hasError: boolean;
  message: string;
}

export interface CreateUserResponse {
  data: {
    id: number;
    name: string;
    email: string;
    phone: string;
    password: string;
    departmentId: number | null;
    companyId: number | null;
    isDelete: boolean;
    isActive: boolean;
    isRider: boolean | null;
    createdAt: string;
    updatedAt: string;
  };
  hasError: boolean;
  message: string;
}

// Department API interfaces
export interface CreateDepartmentRequest {
  name: string;
}

export interface CreateDepartmentResponse {
  data: {
    id: number;
    name: string;
    companyId: number;
    isDelete: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  hasError: boolean;
  message: string;
}

// Update Department Request/Response interfaces
export interface UpdateDepartmentRequest {
  name: string;
}

export interface UpdateDepartmentResponse {
  data: {
    id: number;
    name: string;
    companyId: number;
    isDelete: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  hasError: boolean;
  message: string;
}

// Delete Department Response interface
export interface DeleteDepartmentResponse {
  hasError: boolean;
  message: string;
}

// Request deduplication cache
const pendingRequests = new Map<string, Promise<any>>();

// Login API function with deduplication
export const loginUser = async (credentials: LoginRequest): Promise<LoginResponse> => {
  // Create a unique key for this request
  const requestKey = `login_${credentials.email}_${credentials.password}`;
  
  // Check if the same request is already pending
  if (pendingRequests.has(requestKey)) {
    console.log('Duplicate login request detected, returning cached promise');
    return pendingRequests.get(requestKey)!;
  }

  // Create the request promise
  const requestPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        'Accept': 'application/json',
        },
      mode: 'cors',
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      return data;
    } catch (error) {
      console.error('Login API Error:', error);
      throw error;
    } finally {
      // Clean up the pending request
      pendingRequests.delete(requestKey);
    }
  })();

  // Store the promise in the cache
  pendingRequests.set(requestKey, requestPromise);

  return requestPromise;
};

// Create User API function
export const createUser = async (userData: CreateUserRequest): Promise<CreateUserResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please login first.');
    }

    const response = await fetch(`${API_BASE_URL}/user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create user');
    }

    return data;
  } catch (error) {
    console.error('Create User API Error:', error);
    throw error;
  }
};

// Create Department API function
export const createDepartment = async (departmentData: CreateDepartmentRequest): Promise<CreateDepartmentResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please login first.');
    }

    const response = await fetch(`${API_BASE_URL}/department`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(departmentData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create department');
    }

    return data;
  } catch (error) {
    console.error('Create Department API Error:', error);
    throw error;
  }
};

// Delete User API function
export const deleteUser = async (userId: number): Promise<{ hasError: boolean; message: string }> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please login first.');
    }

    const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete user');
    }

    return data;
  } catch (error) {
    console.error('Delete User API Error:', error);
    throw error;
  }
};

// Get Users API function
export const getUsers = async (): Promise<GetUsersResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please login first.');
    }

    const response = await fetch(`${API_BASE_URL}/user`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch users');
    }

    return data;
  } catch (error) {
    console.error('Get Users API Error:', error);
    throw error;
  }
};

// Get Departments API function
export const getDepartments = async (): Promise<GetDepartmentsResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please login first.');
    }

    const response = await fetch(`${API_BASE_URL}/department`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch departments');
    }

    return data;
  } catch (error) {
    console.error('Get Departments API Error:', error);
    throw error;
  }
};

// Update User API function
export const updateUser = async (userId: number, userData: UpdateUserRequest): Promise<UpdateUserResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please login first.');
    }

    const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update user');
    }

    return data;
  } catch (error) {
    console.error('Update User API Error:', error);
    throw error;
  }
};

// Update User Status API function
export const updateUserStatus = async (userId: number, statusData: UpdateUserStatusRequest): Promise<UpdateUserStatusResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please login first.');
    }

    const response = await fetch(`${API_BASE_URL}/user/update/status/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(statusData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update user status');
    }

    return data;
  } catch (error) {
    console.error('Update User Status API Error:', error);
    throw error;
  }
};

// Update Department API function
export const updateDepartment = async (departmentId: number, departmentData: UpdateDepartmentRequest): Promise<UpdateDepartmentResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please login first.');
    }

    const response = await fetch(`${API_BASE_URL}/department/${departmentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(departmentData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update department');
    }

    return data;
  } catch (error) {
    console.error('Update Department API Error:', error);
    throw error;
  }
};

// Delete Department API function
export const deleteDepartment = async (departmentId: number): Promise<DeleteDepartmentResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please login first.');
    }

    const response = await fetch(`${API_BASE_URL}/department/${departmentId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete department');
    }

    return data;
  } catch (error) {
    console.error('Delete Department API Error:', error);
    throw error;
  }
};

// Logout API function
export const logoutUser = async (): Promise<{ hasError: boolean; message: string }> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please login first.');
    }

    const response = await fetch(`${API_BASE_URL}/user/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to logout');
    }

    return data;
  } catch (error) {
    console.error('Logout API Error:', error);
    throw error;
  }
};

// Helper function to store token in localStorage
export const storeAuthToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

// Helper function to get token from localStorage
export const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Helper function to remove token from localStorage
export const removeAuthToken = (): void => {
  localStorage.removeItem('auth_token');
};

// Helper function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  return token !== null && token !== '';
};

// Notification interface based on API response
export interface NotificationItem {
  id: number;
  companyId: number;
  receiverId: number;
  token: string;
  msg: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Get Notifications API response interface
export interface GetNotificationsResponse {
  data: NotificationItem[];
  hasError: boolean;
  message: string;
  metaData: {
    totalPages: number;
    currentPage: number;
    nextPage: number | null;
    previousPage: number | null;
    totalItems: number;
  };
}

// Get Notifications API function
export const getNotifications = async (limit: number = 5, page: number = 1): Promise<GetNotificationsResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please login first.');
    }

    const response = await fetch(`${API_BASE_URL}/notifications?limit=${limit}&page=${page}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch notifications');
    }

    return data;
  } catch (error) {
    console.error('Get Notifications API Error:', error);
    throw error;
  }
};

// Get User Profile API response interface
export interface GetUserProfileResponse {
  data: {
    updatedAt: string | undefined;
    id: number;
    name: string;
    email: string;
    phone: string;
    password: string;
    departmentId: number | null;
    companyId: number;
    isDelete: boolean;
    isActive: boolean;
    isRider: boolean | null;
    createdAt: string;
  };
  hasError: boolean;
  message: string;
}

// Update User Profile Request interface
export interface UpdateUserProfileRequest {
  name?: string;
  email?: string;
  phone?: string;
}

// Get User Profile API function
export const getUserProfile = async (): Promise<GetUserProfileResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please login first.');
    }

    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      mode: 'cors',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch user profile');
    }

    return data;
  } catch (error) {
    console.error('Get User Profile API Error:', error);
    throw error;
  }
};

// Update User Profile API function
export const updateUserProfile = async (profileData: UpdateUserProfileRequest): Promise<GetUserProfileResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please login first.');
    }

    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      mode: 'cors',
      body: JSON.stringify(profileData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update user profile');
    }

    return data;
  } catch (error) {
    console.error('Update User Profile API Error:', error);
    throw error;
  }
};

// Report generation types
export interface GenerateReportRequest {
  type: string;
  month: number;
}

export interface GenerateReportResponse {
  success: boolean;
  data: string; // Hex data
  message?: string;
}

// Generate report API function
export const generateReport = async (reportData: GenerateReportRequest): Promise<GenerateReportResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please login first.');
    }

    const response = await fetch(`${API_BASE_URL}/generate_report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/octet-stream',
        'Authorization': `Bearer ${token}`,
      },
      mode: 'cors',
      body: JSON.stringify(reportData),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate report: ${response.status} ${response.statusText}`);
    }

    // Get the response as ArrayBuffer (binary data)
    const arrayBuffer = await response.arrayBuffer();
    
    // Convert ArrayBuffer to hex string
    const bytes = new Uint8Array(arrayBuffer);
    const hexString = Array.from(bytes)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');

    return {
      success: true,
      data: hexString,
      message: 'Report generated successfully'
    };
  } catch (error) {
    console.error('Generate Report API Error:', error);
    throw error;
  }
};

// Leaderboard types
export interface LeaderboardRider {
  id: number;
  name: string;
  email: string;
  completedRides: number;
  totalRides: number;
  score: number;
  rank: number;
}

export interface LeaderboardMetaData {
  totalPages: number;
  currentPage: number;
  nextPage: number | null;
  previousPage: number | null;
  totalItems: number;
}

export interface GetLeaderboardResponse {
  data: LeaderboardRider[];
  hasError: boolean;
  message: string;
  metaData: LeaderboardMetaData;
}

// Get leaderboard API function
export const getLeaderboard = async (
  limit: number = 50, 
  page: number = 1, 
  role?: string, 
  search?: string
): Promise<GetLeaderboardResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please login first.');
    }

    // Build query parameters
    const params = new URLSearchParams({
      limit: limit.toString(),
      page: page.toString(),
    });

    if (role && role !== 'all') {
      params.append('role', role);
    }

    if (search && search.trim()) {
      params.append('search', search.trim());
    }

    const response = await fetch(`${API_BASE_URL}/subadmin_leaderboard?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      mode: 'cors',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch leaderboard');
    }

    return data;
  } catch (error) {
    console.error('Get Leaderboard API Error:', error);
    throw error;
  }
};

// Dashboard metadata types
export interface DashboardMetaData {
  activeEmployees: number;
  activeRides: number;
  monthlyRides: number;
  oxygenSaved: string;
}

export interface GetDashboardMetaResponse {
  data: DashboardMetaData;
  hasError: boolean;
  message: string;
}

// Get dashboard metadata API function
export const getDashboardMeta = async (companyId: number = 2): Promise<GetDashboardMetaResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please login first.');
    }

    const response = await fetch(`${API_BASE_URL}/sub_admin_dashboard_meta/${companyId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      mode: 'cors',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch dashboard metadata');
    }

    return data;
  } catch (error) {
    console.error('Get Dashboard Meta API Error:', error);
    throw error;
  }
};

// Employee metadata types
export interface EmployeeMetaData {
  totalEmployees: number;
  totalDrivers: number;
  totalPassengers: number;
  activeRides: number;
}

export interface GetEmployeeMetaResponse {
  data: EmployeeMetaData;
  hasError: boolean;
  message: string;
}

// Get employee metadata API function
export const getEmployeeMeta = async (companyId: number = 2): Promise<GetEmployeeMetaResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please login first.');
    }

    const response = await fetch(`${API_BASE_URL}/sub_admin_employees_meta/${companyId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      mode: 'cors',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch employee metadata');
    }

    return data;
  } catch (error) {
    console.error('Get Employee Meta API Error:', error);
    throw error;
  }
};

// Reports metadata types
export interface ReportsMetaData {
  totalRides: number;
  completionRate: number;
}

export interface GetReportsMetaResponse {
  data: ReportsMetaData;
  hasError: boolean;
  message: string;
}

// Get reports metadata API function
export const getReportsMeta = async (companyId: number = 2): Promise<GetReportsMetaResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please login first.');
    }

    const response = await fetch(`${API_BASE_URL}/sub_admin_reports_meta/${companyId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      mode: 'cors',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch reports metadata');
    }

    return data;
  } catch (error) {
    console.error('Get Reports Meta API Error:', error);
    throw error;
  }
};

// Active rides types
export interface ActiveRide {
  id: number; // Ride ID
  riderId?: number; // User ID of the rider
  creatorId?: number; // User ID of the creator
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

export interface GetActiveRidesResponse {
  data: ActiveRide[];
  hasError: boolean;
  message: string;
}

// Get active rides API function
export const getActiveRides = async (): Promise<GetActiveRidesResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please login first.');
    }

    const response = await fetch(`${API_BASE_URL}/rides/active`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      mode: 'cors',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch active rides');
    }

    return data;
  } catch (error) {
    console.error('Get Active Rides API Error:', error);
    throw error;
  }
};

// Location update API function (based on backend dev's hint about "update location function in postman")
export const updateLocation = async (rideId: number, riderId: number, lat: number, lng: number): Promise<{ hasError: boolean; message: string }> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please login first.');
    }

    const response = await fetch(`${API_BASE_URL}/rides/${rideId}/location`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      mode: 'cors',
      body: JSON.stringify({
        riderId,
        lat,
        lng,
        timestamp: new Date().toISOString()
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update location');
    }

    return data;
  } catch (error) {
    console.error('Update Location API Error:', error);
    throw error;
  }
};

// Reports list types
export interface ReportItem {
  id: number;
  type: string;
  month: number;
  year: number;
  companyId: number;
  creatorId: number;
  createdAt: string;
}

export interface GetReportsListResponse {
  data: ReportItem[];
  hasError: boolean;
  message: string;
  metaData: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Get reports list API function
export const getReportsList = async (page: number = 1, limit: number = 10, reportType?: string, month?: number, year?: number): Promise<GetReportsListResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please login first.');
    }

    // Build query parameters
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (reportType) {
      params.append('reportType', reportType);
    }
    if (month) {
      params.append('month', month.toString());
    }
    if (year) {
      params.append('year', year.toString());
    }

    const response = await fetch(`${API_BASE_URL}/reports?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      mode: 'cors',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch reports list');
    }

    return data;
  } catch (error) {
    console.error('Get Reports List API Error:', error);
    throw error;
  }
};

// Download report API functions
export const downloadReport = async (reportId: number): Promise<Blob> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please login first.');
    }

    const response = await fetch(`${API_BASE_URL}/reports/${reportId}/download`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/pdf',
        'Authorization': `Bearer ${token}`,
      },
      mode: 'cors',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to download report: ${response.status}`);
    }

    // Return the blob directly for PDF download
    return await response.blob();
  } catch (error) {
    console.error('Download Report API Error:', error);
    throw error;
  }
};

// Update Password Request/Response interfaces
export interface UpdatePasswordRequest {
  old_password: string;
  password: string;
}

export interface UpdatePasswordResponse {
  hasError: boolean;
  message: string;
}

// Update Password API function
export const updatePassword = async (passwordData: UpdatePasswordRequest): Promise<UpdatePasswordResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please login first.');
    }

    const response = await fetch(`${API_BASE_URL}/user/update_password`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      mode: 'cors',
      body: JSON.stringify(passwordData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update password');
    }

    return data;
  } catch (error) {
    console.error('Update Password API Error:', error);
    throw error;
  }
};

// Forgot Password Request/Response interfaces
export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  hasError: boolean;
  message: string;
}

// Verify OTP Request/Response interfaces
export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  hasError: boolean;
  message: string;
  data?: {
    token: string;
  };
}

// Reset Password Request/Response interfaces
export interface ResetPasswordRequest {
  email: string;
  otp: string;
  password: string;
}

export interface ResetPasswordResponse {
  hasError: boolean;
  message: string;
}

// Forgot Password API function
export const forgotPassword = async (email: string): Promise<ForgotPasswordResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/forgot_password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send OTP');
    }

    return data;
  } catch (error) {
    console.error('Forgot Password API Error:', error);
    throw error;
  }
};

// Verify OTP API function
export const verifyOtp = async (email: string, otp: string): Promise<VerifyOtpResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/otp/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to verify OTP');
    }

    return data;
  } catch (error) {
    console.error('Verify OTP API Error:', error);
    throw error;
  }
};

// Reset Password API function
export const resetPassword = async (email: string, otp: string, password: string): Promise<ResetPasswordResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/reset_password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      mode: 'cors',
      body: JSON.stringify({ email, otp, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to reset password');
    }

    return data;
  } catch (error) {
    console.error('Reset Password API Error:', error);
    throw error;
  }
};

// Rides Trend interfaces
export interface RidesTrendDataPoint {
  label: string;
  rides: number;
}

export interface RidesTrendResponse {
  data: {
    filter: string;
    data: RidesTrendDataPoint[];
  };
  hasError: boolean;
  message: string;
}

// Riders Performance interfaces
export interface RiderPerformanceDataPoint {
  rider: string;
  rides: number;
}

export interface RidersPerformanceResponse {
  data: {
    filter: string;
    data: RiderPerformanceDataPoint[];
  };
  hasError: boolean;
  message: string;
}

// Rides Trend API function
export const getRidesTrend = async (filter: 'daily' | 'weekly' | 'monthly' | 'yearly'): Promise<RidesTrendResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please login first.');
    }

    const response = await fetch(`${API_BASE_URL}/rides_trends?filter=${filter}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch rides trend data');
    }

    return data;
  } catch (error) {
    console.error('Rides Trend API Error:', error);
    throw error;
  }
};

// Riders Performance API function
export const getRidersPerformance = async (filter: 'daily' | 'weekly' | 'monthly' | 'yearly'): Promise<RidersPerformanceResponse> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found. Please login first.');
    }

    const response = await fetch(`${API_BASE_URL}/riders_rides?filter=${filter}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch riders performance data');
    }

    return data;
  } catch (error) {
    console.error('Riders Performance API Error:', error);
    throw error;
  }
};

// API error handler
export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
};
