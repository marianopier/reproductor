
import React from 'react';

interface IconProps {
  className?: string;
}

const NextTrackIcon: React.FC<IconProps> = ({ className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M6 4l10 8-10 8V4zm11 0v16h2V4h-2z" />
  </svg>
);

export default NextTrackIcon;
