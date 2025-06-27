// Tennis-themed SVG icons for use throughout the site

export const TennisBallIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3c-1.5 3-1.5 6 0 9s1.5 6 0 9" />
    <path d="M12 3c1.5 3 1.5 6 0 9s-1.5 6 0 9" />
  </svg>
)

export const TennisRacquetIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <ellipse cx="12" cy="7" rx="7" ry="5" />
    <path d="M12 12v9" />
    <path d="M8 7h8M10 4h4M10 10h4" />
    <path d="M7 6v2M17 6v2" />
  </svg>
)

export const TennisCourtIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <rect x="3" y="5" width="18" height="14" rx="1" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="7" y1="8" x2="17" y2="8" />
    <line x1="7" y1="16" x2="17" y2="16" />
  </svg>
)

export const TrophyIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M8 21h8m-4-4v4m0-4a5 5 0 0 1-5-5V8m5 9a5 5 0 0 0 5-5V8M7 8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2 1 1 0 0 1 1 1v5m9-5a1 1 0 0 1 1-1 2 2 0 0 1 2 2v2a2 2 0 0 1-2 2m-1-5v5m-7-5h8" />
  </svg>
)

export const ScoreboardIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <line x1="12" y1="4" x2="12" y2="20" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <text x="6" y="8" fontSize="6" fill="currentColor">0</text>
    <text x="15" y="8" fontSize="6" fill="currentColor">0</text>
  </svg>
)

export const TennisNetIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <line x1="2" y1="12" x2="22" y2="12" />
    <line x1="2" y1="8" x2="2" y2="16" />
    <line x1="22" y1="8" x2="22" y2="16" />
    <path d="M6 12v-2M10 12v-2M14 12v-2M18 12v-2" strokeWidth="1" />
    <path d="M4 10h16" strokeWidth="3" />
  </svg>
)

export const TennisServeIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v6l-2 2M12 13l2 2M10 19l2-2 2 2" />
    <circle cx="18" cy="3" r="1.5" fill="currentColor" />
    <path d="M16 4l-2 2" strokeWidth="1.5" />
  </svg>
)

export const ClockIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
)

export const CalendarIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

export const LocationIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)