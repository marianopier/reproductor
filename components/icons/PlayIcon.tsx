
import React from 'react';

interface IconProps {
  className?: string;
}

const PlayIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M6 4l12 8-12 8z" />
  </svg>
);

export default PlayIcon;
