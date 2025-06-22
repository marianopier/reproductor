
import React from 'react';
import PlayIcon from './icons/PlayIcon';
import PauseIcon from './icons/PauseIcon';
import NextTrackIcon from './icons/NextTrackIcon';
import PreviousTrackIcon from './icons/PreviousTrackIcon';

interface PlayerControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  disabled: boolean;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
  disabled,
}) => {
  const buttonClass = "p-3 rounded-full hover:bg-slate-700 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed";
  const mainButtonClass = "p-4 bg-teal-500 text-slate-900 rounded-full hover:bg-teal-400 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed";
  
  return (
    <div className="flex items-center justify-center space-x-4">
      <button onClick={onPrevious} className={buttonClass} disabled={disabled} aria-label="Previous track">
        <PreviousTrackIcon className="w-5 h-5 text-slate-300" />
      </button>
      <button onClick={onPlayPause} className={mainButtonClass} disabled={disabled} aria-label={isPlaying ? "Pause" : "Play"}>
        {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
      </button>
      <button onClick={onNext} className={buttonClass} disabled={disabled} aria-label="Next track">
        <NextTrackIcon className="w-5 h-5 text-slate-300" />
      </button>
    </div>
  );
};

export default PlayerControls;
