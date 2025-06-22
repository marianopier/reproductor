
export interface Track {
  id: string;
  title: string;
  artist: string;
  audioSrc: string;
  albumArtUrl: string;
  duration?: string; // Optional: can be fetched or predefined
  lyrics?: string;
}