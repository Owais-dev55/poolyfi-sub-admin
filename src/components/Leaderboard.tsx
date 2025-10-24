import { useState, useEffect, useRef } from "react";
import { getLeaderboard, handleApiError } from "../apis/user/api";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// Leaderboard types
interface LeaderboardRider {
  id: number;
  name: string;
  email: string;
  completedRides: number;
  totalRides: number;
  score: number;
  rank: number;
}

const Leaderboard = () => {
  const [sortBy, setSortBy] = useState("rank");
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [employees, setEmployees] = useState<LeaderboardRider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(50); // Show more records by default
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const leaderboardFetched = useRef(false);

  // Fetch leaderboard data
  const fetchLeaderboard = async (
    page: number = currentPage,
    pageLimit: number = limit
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await getLeaderboard(
        pageLimit,
        page,
        roleFilter,
        debouncedSearchTerm
      );

      if (response.hasError) {
        throw new Error(response.message || "Failed to fetch leaderboard");
      }

      setEmployees(response.data);
      setTotalPages(response.metaData?.totalPages || 1);
      setTotalItems(response.metaData?.totalItems || response.data.length);
      setCurrentPage(response.metaData?.currentPage || 1);
    } catch (error) {
      console.error("Leaderboard fetch error:", error);
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Initial fetch for Top Performers (3 records)
  useEffect(() => {
    if (!leaderboardFetched.current) {
      fetchLeaderboard(1, 3);
      leaderboardFetched.current = true;
    }
  }, []);

  // Fetch more data when filters change
  useEffect(() => {
    if (leaderboardFetched.current) {
      fetchLeaderboard(currentPage, limit);
    }
  }, [limit, currentPage, roleFilter, debouncedSearchTerm]);

  // Since we're using server-side filtering, we only need client-side sorting
  const filteredEmployees = employees.sort((a, b) => {
    const getValue = (emp: LeaderboardRider) => {
        switch (sortBy) {
        case "name":
          return emp.name.toLowerCase();
        case "rides":
          return emp.completedRides;
        case "score":
          return emp.score;
        default:
          return emp.rank;
      }
    };
    const aVal = getValue(a),
      bVal = getValue(b);
    return sortOrder === "asc" ? (aVal > bVal ? 1 : -1) : aVal < bVal ? 1 : -1;
    });

  const handleSort = (column: string) => {
    setSortBy(column);
    setSortOrder(sortBy === column && sortOrder === "asc" ? "desc" : "asc");
  };

  const SortIcon = ({ column }: { column: string }) => {
    const isActive = sortBy === column;
    const isAsc = sortOrder === "asc";
    const color = isActive ? "text-gray-600" : "text-gray-400";
    const path = isActive
      ? isAsc
        ? "M5 15l7-7 7 7"
        : "M19 9l-7 7-7-7"
      : "M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4";
    
    return (
      <svg
        className={`w-4 h-4 ${color}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d={path}
        />
      </svg>
    );
  };

  return (
    <div className="flex-1 min-h-screen">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg p-8 mb-8 shadow-sm border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
              Top Performers
            </h2>
            <div className="flex justify-center items-end space-x-8">
              {loading ? (
                // Skeleton loading for top performers
                <>
                  {[0, 1, 2].map((pos) => (
                    <div key={pos} className="flex flex-col items-center">
                      <div className="bg-gray-100 rounded-lg p-4 mb-4 shadow-sm border border-gray-200">
                        <Skeleton circle height={pos === 1 ? 80 : 64} width={pos === 1 ? 80 : 64} />
                      </div>
                      <div className="text-center space-y-2">
                        <Skeleton height={20} width={80} />
                        <Skeleton height={16} width={60} />
                        <Skeleton height={14} width={50} />
                      </div>
                    </div>
                  ))}
                </>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="text-red-500 text-sm mb-2">{error}</div>
                  <button 
                    onClick={() => fetchLeaderboard(1, 3)}
                    className="text-xs bg-[#FFC11E] text-black px-3 py-1 rounded hover:bg-[#E6A91A] transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : employees.length > 0 ? (
                // Display top 3 performers from API with first place in center
                [1, 0, 2].map((pos) => {
                  const employee = employees[pos];
                  if (!employee) return null;
                  
                  const isHighlighted = pos === 0; // First place (center) is highlighted
                  const initials = employee.name.split(' ').map(n => n[0]).join('').toUpperCase();
                  
                  return (
                    <div key={employee.id} className="flex flex-col items-center">
                      <div
                        className={`bg-gray-100 rounded-lg p-4 mb-4 shadow-sm border border-gray-200 ${
                          isHighlighted ? "transform scale-110" : ""
                        }`}
                      >
                        <div
                          className={`${
                            isHighlighted
                              ? "w-20 h-20 text-2xl bg-[#FFC11E] text-black"
                              : "w-16 h-16 text-xl bg-gray-300 text-gray-600"
                          } rounded-full flex items-center justify-center font-bold`}
                        >
                          {initials}
                        </div>
                      </div>
                      <div className="text-center">
                        <h3
                          className={`${
                            isHighlighted ? "text-xl" : "text-lg"
                          } font-semibold text-gray-900 mb-1`}
                        >
                          {employee.name}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {employee.completedRides} rides
                        </p>
                        <p className="text-gray-500 text-xs">
                          {employee.score.toLocaleString()} points
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                // Fallback when no data
                <div className="text-center py-8">
                  <div className="text-gray-500 text-sm">No performers data available</div>
                </div>
              )}
            </div>
            <div className="text-center mt-8"></div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 space-y-4 lg:space-y-0">
                <h2 className="text-xl font-semibold text-gray-900">
                  Employee Rankings
                </h2>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black appearance-none bg-white text-black"
                  />
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black appearance-none bg-white text-black cursor-pointer"
                  >
                    <option value="all">All Roles</option>
                    <option value="rider">Driver</option>
                    <option value="passenger">Passenger</option>
                  </select>
                  
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {["rank", "name", "rides", "score"].map((col, i) => (
                      <th 
                        key={col}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort(col)}
                      >
                        <div className="flex items-center space-x-1">
                          <span>
                            {["Rank", "Employee", "Rides", "Score"][i]}
                          </span>
                          <SortIcon column={col} />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <>
                      {[...Array(10)].map((_, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Skeleton height={20} width={30} />
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <Skeleton circle height={40} width={40} />
                              </div>
                              <div className="ml-4">
                                <Skeleton height={16} width={120} />
                                <Skeleton height={14} width={80} className="mt-1" />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Skeleton height={16} width={60} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Skeleton height={16} width={40} />
                          </td>
                        </tr>
                      ))}
                    </>
                  ) : error ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center">
                        <div className="text-red-600 text-sm">
                          {error}
                          <button
                            onClick={() => {
                              leaderboardFetched.current = false;
                              fetchLeaderboard();
                            }}
                            className="ml-2 text-[#FFC11E] hover:text-[#E6B800] underline"
                          >
                            Retry
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : filteredEmployees.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-8 text-center text-gray-500 text-sm"
                      >
                        No employees found
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((employee) => (
                      <tr
                        key={employee.id}
                        className="hover:bg-gray-50 transition-colors group"
                      >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                            <span className="text-gray-900 font-semibold text-sm">
                              #{employee.rank}
                            </span>
                            {employee.rank <= 3 && (
                              <div className="ml-2 w-2 h-2 bg-[#FFC11E] rounded-full"></div>
                            )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-sm shadow-sm">
                              {employee.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {employee.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {employee.email}
                              </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {employee.completedRides}
                          </div>
                          <div className="text-xs text-gray-500">
                            of {employee.totalRides} rides
                          </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className={`h-2 rounded-full ${
                                  employee.score >= 90
                                    ? "bg-green-500"
                                    : employee.score >= 70
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                }`}
                                style={{
                                  width: `${Math.min(employee.score, 100)}%`,
                                }}
                            ></div>
                          </div>
                            <span className="text-sm font-medium text-gray-900">
                              {employee.score}%
                            </span>
                        </div>
                      </td>
                    </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {filteredEmployees.length}
                  </span>{" "}
                  of <span className="font-medium">{totalItems}</span> employees
                  {totalPages > 1 && (
                    <span className="ml-2 text-gray-500">
                      (Page {currentPage} of {totalPages})
                    </span>
                  )}
                </p>
                <div className="flex items-center space-x-2">
                  <select
                    value={limit}
                    onChange={(e) => {
                      const newLimit =
                        e.target.value === "all"
                          ? 1000
                          : Number(e.target.value);
                      setLimit(newLimit);
                      setCurrentPage(1); // Reset to first page when changing limit
                    }}
                    className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-black focus:border-black appearance-none bg-white text-black cursor-pointer"
                  >
                    <option value={10}>10 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={100}>100 per page</option>
                    <option value={200}>200 per page</option>
                    <option value="all">Show All</option>
                  </select>

                  {totalPages > 1 && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="px-2 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        First
                      </button>
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-2 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        Previous
                      </button>
                      <span className="px-3 py-1 text-sm bg-[#FFC11E] text-black rounded">
                        {currentPage}
                      </span>
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-2 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        Next
                      </button>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="px-2 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        Last
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
