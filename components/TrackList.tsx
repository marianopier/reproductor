
import React from 'react';
import { Track } from '../types';
import PlayIcon from './icons/PlayIcon';
import PauseIcon from './icons/PauseIcon';

interface TrackListProps {
  tracks: Track[];
  currentTrackId?: string;
  onTrackSelect: (trackId: string) => void;
  isPlaying: boolean;
}

const TrackListItem: React.FC<{
  track: Track;
  isCurrent: boolean;
  onSelect: () => void;
  isPlayingCurrent: boolean;
}> = ({ track, isCurrent, onSelect, isPlayingCurrent }) => {
  return (
    <li
      onClick={onSelect}
      className={`p-3 flex items-center justify-between cursor-pointer rounded-md transition-all duration-150 ease-in-out group
                  ${isCurrent ? 'bg-teal-500 text-slate-900 shadow-lg' : 'hover:bg-slate-700 text-slate-300 hover:text-white'}`}
    >
      <div className="flex items-center space-x-3">
        {isCurrent && isPlayingCurrent ? (
          <PauseIcon className={`w-5 h-5 ${isCurrent ? 'text-slate-900' : 'text-teal-500'}`} />
        ) : isCurrent && !isPlayingCurrent ? (
           <PlayIcon className={`w-5 h-5 ${isCurrent ? 'text-slate-900' : 'text-teal-500'}`} />
        ) : (
          <span className={`text-sm font-medium w-5 text-center ${isCurrent ? 'text-slate-800' : 'text-slate-500 group-hover:text-teal-400'}`}>
            {track.id}
          </span>
        )}
        <div>
          <p className={`font-semibold text-sm ${isCurrent ? 'text-slate-900' : 'text-slate-100 group-hover:text-white'}`}>{track.title}</p>
          <p className={`text-xs ${isCurrent ? 'text-slate-800' : 'text-slate-400 group-hover:text-slate-300'}`}>{track.artist}</p>
        </div>
      </div>
      {/* Optional: Add track duration here if available */}
      {/* <span className={`text-xs ${isCurrent ? 'text-slate-800' : 'text-slate-400'}`}>{track.duration || '0:00'}</span> */}
    </li>
  );
};


const TrackList: React.FC<TrackListProps> = ({ tracks, currentTrackId, onTrackSelect, isPlaying }) => {
  if (!tracks || tracks.length === 0) {
    return <p className="text-slate-400 text-center py-4">No tracks available.</p>;
  }

  return (
    <ul className="space-y-2">
      {tracks.map((track) => (
        <TrackListItem
          key={track.id}
          track={track}
          isCurrent={track.id === currentTrackId}
          isPlayingCurrent={track.id === currentTrackId && isPlaying}
          onSelect={() => onTrackSelect(track.id)}
        />
      ))}
    </ul>
  );
};

export default TrackList;
