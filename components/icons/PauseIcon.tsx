
import React from 'react';

interface IconProps {
  className?: string;
}

const PauseIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M6 4h4v16H6zm8 0h4v16h-4z" />
  </svg>
);

export default PauseIcon;
