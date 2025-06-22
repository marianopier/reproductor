
import React from 'react';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

const formatTime = (time: number): string => {
  if (isNaN(time) || time === Infinity) {
    return '0:00';
  }
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const ProgressBar: React.FC<ProgressBarProps> = ({ currentTime, duration, onSeek }) => {
  const handleProgressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSeek(Number(event.target.value));
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-slate-400 mb-1">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
      <input
        type="range"
        min="0"
        max={duration || 0}
        value={currentTime || 0}
        onChange={handleProgressChange}
        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
        style={{
          background: `linear-gradient(to right, #14b8a6 ${progressPercentage}%, #334155 ${progressPercentage}%)` // teal-500, slate-700
        }}
      />
    </div>
  );
};

export default ProgressBar;
