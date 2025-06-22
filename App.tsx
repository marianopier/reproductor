
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Track } from './types';
import { ALBUM_TRACKS, ALBUM_TITLE, ARTIST_NAME } from './constants';
import AlbumArt from './components/AlbumArt';
import ProgressBar from './components/ProgressBar';
import PlayerControls from './components/PlayerControls';
import TrackList from './components/TrackList';

const App: React.FC = () => {
  const [tracks] = useState<Track[]>(ALBUM_TRACKS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [currentTrackError, setCurrentTrackError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = tracks[currentTrackIndex];

  const playNextTrack = useCallback(() => {
    setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % tracks.length);
  }, [tracks.length]);

  const playPreviousTrack = useCallback(() => {
    setCurrentTrackIndex((prevIndex) => (prevIndex - 1 + tracks.length) % tracks.length);
  }, [tracks.length]);

  // Effect for handling audio element setup, source changes, and event listeners
  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement || !currentTrack) return;

    setCurrentTrackError(null); // Reset error when track changes

    const handleTimeUpdate = () => {
      if (!isNaN(audioElement.currentTime)) {
        setCurrentTime(audioElement.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      // Ensure the audioElement reference is fresh, especially inside async callbacks or event handlers
      const currentAudioEl = audioRef.current;
      if (!currentAudioEl) return;

      if (!isNaN(currentAudioEl.duration) && isFinite(currentAudioEl.duration)) {
        setDuration(currentAudioEl.duration);
        setCurrentTrackError(null); // Clear error if metadata loads

        // If this loadedmetadata event is for the current track we intend to play,
        // and 'isPlaying' state is true, then actually start playback.
        if (currentAudioEl.src === currentTrack.audioSrc && isPlaying) {
          const playPromise = currentAudioEl.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.error("Error auto-playing from loadedmetadata:", error);
              if (error.name === 'NotAllowedError') {
                setCurrentTrackError("La reproducción automática fue bloqueada. Haz clic en play para iniciar.");
              } else {
                setCurrentTrackError(`No se pudo reproducir: ${error.message}`);
              }
              setIsPlaying(false); // Update state if play fails
            });
          }
        }
      } else {
        setDuration(0);
      }
    };

    const handleEnded = () => playNextTrack();
    
    const handleError = () => {
      const error = audioElement.error;
      console.error(
        "Audio error event on:", audioElement.src, 
        "Code:", error?.code, 
        "Message:", error?.message,
        "Raw Error Object:", error
      );
      
      let message = "Error de audio desconocido.";
      if (error) {
        switch (error.code) {
          case MediaError.MEDIA_ERR_ABORTED:
            message = "Reproducción abortada.";
            break;
          case MediaError.MEDIA_ERR_NETWORK:
            message = "Error de red al cargar el audio.";
            break;
          case MediaError.MEDIA_ERR_DECODE:
            message = "Error al decodificar el audio.";
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            message = "Formato de audio no compatible o enlace incorrecto.";
            break;
          default:
            message = `Error de audio: ${error.message || 'Código ' + error.code}`;
        }
      }
      setCurrentTrackError(message);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
    };

    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    audioElement.addEventListener('ended', handleEnded);
    audioElement.addEventListener('error', handleError);

    if (audioElement.src !== currentTrack.audioSrc) {
      audioElement.src = currentTrack.audioSrc;
      audioElement.load(); 
      // Playback for new src if isPlaying is true will be handled by 'handleLoadedMetadata'
    } else if (isPlaying && audioElement.paused && audioElement.readyState >= HTMLMediaElement.HAVE_METADATA) {
      // This case: src is THE SAME, but it's paused and should be playing.
      // e.g. user paused then pressed play on same track. Also covered by the 'isPlaying' effect.
      const playPromise = audioElement.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error("Error calling play() in main effect for same track:", error);
           if (error.name === 'NotAllowedError') {
              setCurrentTrackError("La reproducción automática fue bloqueada. Haz clic en play para iniciar.");
          } else {
              setCurrentTrackError(`No se pudo reproducir: ${error.message}`);
          }
          setIsPlaying(false);
        });
      }
    }


    return () => {
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
      audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audioElement.removeEventListener('ended', handleEnded);
      audioElement.removeEventListener('error', handleError);
    };
  // Added isPlaying to dependencies so handleLoadedMetadata has the correct isPlaying value
  }, [currentTrack, playNextTrack, isPlaying, setIsPlaying, setCurrentTime, setDuration, setCurrentTrackError]);

  // Effect for handling play/pause state changes triggered by UI or programmatically
  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement || !currentTrack) return;

    if (isPlaying) {
      if (currentTrackError && !currentTrackError.includes("automática fue bloqueada")) {
        setIsPlaying(false); // Stop trying to play if there's a persistent error
        return;
      }
      // Attempt to play if:
      // 1. Audio source is correct for the current track.
      // 2. Audio is ready.
      // 3. Audio is actually paused (don't call play if already playing/attempting).
      if (
        audioElement.src === currentTrack.audioSrc &&
        audioElement.paused && 
        audioElement.readyState >= HTMLMediaElement.HAVE_METADATA
      ) {
        const playPromise = audioElement.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Error calling play() in isPlaying effect:", error);
            if (error.name === 'NotAllowedError') {
              setCurrentTrackError("La reproducción automática fue bloqueada. Haz clic en play para iniciar.");
            } else {
              setCurrentTrackError(`No se pudo reproducir: ${error.message}`);
            }
            setIsPlaying(false);
          });
        }
      }
      // If src is different, or not ready, the other effect (listening to currentTrack changes)
      // is responsible for loading it, and its 'handleLoadedMetadata' will trigger play if isPlaying is true.
    } else {
      if (!audioElement.paused) { 
        audioElement.pause();
      }
    }
  }, [isPlaying, currentTrack, currentTrackError, setIsPlaying, setCurrentTrackError]);


  const handlePlayPause = useCallback(() => {
    if (!audioRef.current || !currentTrack) return;
    
    if(currentTrackError && !currentTrackError.includes("automática fue bloqueada")){
        setCurrentTrackError(null);
    }

    if (audioRef.current.src !== currentTrack.audioSrc) {
        // If src is different, set it, load, and signal intent to play.
        // The main useEffect's 'loadedmetadata' will handle actual playback.
        audioRef.current.src = currentTrack.audioSrc;
        audioRef.current.load();
        setIsPlaying(true); 
    } else {
        // Src is correct, just toggle play state.
        setIsPlaying(prevIsPlaying => !prevIsPlaying);
    }
  }, [currentTrack, setIsPlaying, setCurrentTrackError, currentTrackError]);

  const handleSelectTrack = useCallback((trackId: string) => {
    const trackIndex = tracks.findIndex(t => t.id === trackId);
    if (trackIndex !== -1) {
      const DONT_AUTO_PLAY_ON_SELECT = false; 
      if (currentTrackIndex === trackIndex) { 
        handlePlayPause(); 
      } else {
        setCurrentTrackIndex(trackIndex);
        if (isPlaying || !DONT_AUTO_PLAY_ON_SELECT) {
            setIsPlaying(true);
        } else {
            setIsPlaying(false); 
        }
      }
    }
  }, [tracks, currentTrackIndex, handlePlayPause, isPlaying, setIsPlaying]);

  const handleSeek = useCallback((time: number) => {
    if (audioRef.current && !isNaN(time) && isFinite(time)) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 selection:bg-teal-500 selection:text-white">
      <audio ref={audioRef} />
      <div className="w-full max-w-4xl mx-auto bg-slate-800/75 shadow-2xl rounded-xl overflow-hidden">
        <div className="md:flex">
          {/* Left Column: Album Art, Info, Controls */}
          <div className="md:w-1/2 lg:w-2/5 p-6 md:p-8 bg-slate-800/50 flex flex-col items-center md:items-start">
            <div className="w-full max-w-xs sm:max-w-sm md:max-w-none mb-6">
              <AlbumArt src={currentTrack?.albumArtUrl} alt={currentTrack?.title || 'Album Art'} />
            </div>
            <div className="text-center md:text-left w-full">
              <h1 className="text-2xl sm:text-3xl font-bold text-white truncate" title={currentTrack?.title}>
                {currentTrack?.title || 'Seleccionar pista'}
              </h1>
              <p className="text-lg text-slate-300 truncate mt-1" title={currentTrack?.artist || ARTIST_NAME}>
                {currentTrack?.artist || ARTIST_NAME}
              </p>
              {currentTrackError && (
                <p className="mt-3 text-sm text-red-400 bg-red-900/40 p-3 rounded-md shadow animate-pulse" role="alert">
                  {currentTrackError}
                </p>
              )}
            </div>
            <div className="mt-6 w-full">
              <ProgressBar 
                currentTime={currentTime}
                duration={duration}
                onSeek={handleSeek}
              />
            </div>
            <div className="mt-6 w-full">
              <PlayerControls 
                isPlaying={isPlaying}
                onPlayPause={handlePlayPause}
                onNext={playNextTrack}
                onPrevious={playPreviousTrack}
                disabled={!currentTrack || !!currentTrackError && !currentTrackError.includes("automática fue bloqueada")}
              />
            </div>
          </div>

          {/* Right Column: Track List & Lyrics */}
          <div className="md:w-1/2 lg:w-3/5 p-6 md:p-8 flex flex-col md:max-h-[70vh] lg:max-h-[calc(100vh-10rem)]">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-white">Lista de Canciones</h2>
            </div>
            <div className="flex-1 overflow-y-auto pr-1 pb-2 min-h-[150px]">
              <TrackList
                tracks={tracks}
                currentTrackId={currentTrack?.id}
                onTrackSelect={handleSelectTrack}
                isPlaying={isPlaying}
              />
            </div>
            
            <div className="flex-shrink-0 border-t border-slate-700 pt-4 mt-4">
              <h3 id="lyrics-heading" className="text-lg font-semibold text-white mb-2">Letra</h3>
              <div 
                className="text-sm text-slate-300 whitespace-pre-wrap overflow-y-auto max-h-32 sm:max-h-36 md:max-h-40 pr-1"
                role="region"
                aria-labelledby="lyrics-heading"
              >
                {currentTrack?.lyrics || 'Letra no disponible.'}
              </div>
            </div>
          </div>
        </div>
        <footer className="text-center p-4 border-t border-slate-700 mt-auto">
            <p className="text-xs text-slate-500">
                &copy; {new Date().getFullYear()} {ARTIST_NAME} - {ALBUM_TITLE}. Reproductor de música.
            </p>
        </footer>
      </div>
    </div>
  );
};

export default App;