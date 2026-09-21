export interface YoutubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  position: number;
}

export interface YoutubePlaylist {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  itemCount: number;
  videos: YoutubeVideo[];
  addedAt: string;
}

export type YoutubeWatchedVideos = Record<string, string[]>;
