interface IconProps {
  className?: string;
  size?: number;
}

export const UsersIcon = ({ className = "w-6 h-6", size }: IconProps) => (
  <svg 
    className={className} 
    width={size} 
    height={size} 
    fill="currentColor" 
    viewBox="0 0 24 24"
  >
    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    <path d="M8 7a2 2 0 114 0 2 2 0 01-4 0z" />
    <path d="M16 7a2 2 0 114 0 2 2 0 01-4 0z" />
  </svg>
);

export const BarChartIcon = ({ className = "w-6 h-6", size }: IconProps) => (
  <svg 
    className={className} 
    width={size} 
    height={size} 
    fill="currentColor" 
    viewBox="0 0 24 24"
  >
    <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
  </svg>
);

export const RefreshIcon = ({ className = "w-6 h-6", size }: IconProps) => (
  <svg 
    className={className} 
    width={size} 
    height={size} 
    fill="currentColor" 
    viewBox="0 0 24 24"
  >
    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
  </svg>
);

export const CalendarIcon = ({ className = "w-6 h-6", size }: IconProps) => (
  <svg 
    className={className} 
    width={size} 
    height={size} 
    fill="currentColor" 
    viewBox="0 0 24 24"
  >
    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
  </svg>
);

export const DollarIcon = ({ className = "w-6 h-6", size }: IconProps) => (
  <svg 
    className={className} 
    width={size} 
    height={size} 
    fill="currentColor" 
    viewBox="0 0 24 24"
  >
    <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
  </svg>
);

export const PlusIcon = ({ className = "w-6 h-6", size }: IconProps) => (
  <svg 
    className={className} 
    width={size} 
    height={size} 
    fill="currentColor" 
    viewBox="0 0 24 24"
  >
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </svg>
);

export const DownloadIcon = ({ className = "w-6 h-6", size }: IconProps) => (
  <svg 
    className={className} 
    width={size} 
    height={size} 
    fill="currentColor" 
    viewBox="0 0 24 24"
  >
    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
  </svg>
);

export const LocationIcon = ({ className = "w-6 h-6", size }: IconProps) => (
  <svg 
    className={className} 
    width={size} 
    height={size} 
    fill="currentColor" 
    viewBox="0 0 24 24"
  >
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </svg>
);

export const SettingsIcon = ({ className = "w-6 h-6", size }: IconProps) => (
  <svg 
    className={className} 
    width={size} 
    height={size} 
    fill="currentColor" 
    viewBox="0 0 24 24"
  >
    <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94zM12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" />
  </svg>
);

export const CheckIcon = ({ className = "w-6 h-6", size }: IconProps) => (
  <svg 
    className={className} 
    width={size} 
    height={size} 
    fill="currentColor" 
    viewBox="0 0 24 24"
  >
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </svg>
);

export const ClockIcon = ({ className = "w-6 h-6", size }: IconProps) => (
  <svg 
    className={className} 
    width={size} 
    height={size} 
    fill="currentColor" 
    viewBox="0 0 24 24"
  >
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
    <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
  </svg>
);

export const XIcon = ({ className = "w-6 h-6", size }: IconProps) => (
  <svg 
    className={className} 
    width={size} 
    height={size} 
    fill="currentColor" 
    viewBox="0 0 24 24"
  >
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
);

export const ActivityIcon = ({ className = "w-6 h-6", size }: IconProps) => (
  <svg 
    className={className} 
    width={size} 
    height={size} 
    fill="currentColor" 
    viewBox="0 0 24 24"
  >
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
  </svg>
);

export const LeaderboardIcon = ({ className = "w-6 h-6", size }: IconProps) => (
  <svg 
    className={className} 
    width={size} 
    height={size} 
    fill="currentColor" 
    viewBox="0 0 24 24"
  >
    <path d="M7.5 21H2V9h5.5v12zm7.25-18h-5.5v18h5.5V3zM22 11h-5.5v10H22V11z" />
  </svg>
);

export const CashIcon = ({ className = "w-6 h-6", size }: IconProps) => (
  <svg 
    className={className} 
    width={size} 
    height={size} 
    fill="currentColor" 
    viewBox="0 0 24 24"
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
  </svg>
);

export const RibbonIcon = ({ className = "w-6 h-6", size }: IconProps) => (
  <svg 
    className={className} 
    width={size} 
    height={size} 
    fill="currentColor" 
    viewBox="0 0 24 24"
  >
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);