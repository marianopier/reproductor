
import React from 'react';

interface IconProps {
  className?: string;
}

const PreviousTrackIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M18 4l-10 8 10 8V4zM5 4v16H3V4h2z" />
  </svg>
);

export default PreviousTrackIcon;
