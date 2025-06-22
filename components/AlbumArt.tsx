
import React from 'react';
import MusicNoteIcon from './icons/MusicNoteIcon';

interface AlbumArtProps {
  src?: string;
  alt: string;
}

const AlbumArt: React.FC<AlbumArtProps> = ({ src, alt }) => {
  const [imageError, setImageError] = React.useState(false);

  React.useEffect(() => {
    setImageError(false); // Reset error state when src changes
  }, [src]);

  if (!src || imageError) {
    return (
      <div className="w-full aspect-square bg-slate-700 flex items-center justify-center rounded-lg shadow-lg">
        <MusicNoteIcon className="w-24 h-24 text-slate-500" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-full aspect-square object-cover rounded-lg shadow-xl"
      onError={() => setImageError(true)}
    />
  );
};

export default AlbumArt;
