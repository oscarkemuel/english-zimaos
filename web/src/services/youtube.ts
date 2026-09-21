import type { YoutubePlaylist, YoutubeVideo } from "@/types/youtube";

const API_URL = "https://www.googleapis.com/youtube/v3";

const getApiKey = () => {
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

  if (!apiKey) {
    throw new Error("VITE_YOUTUBE_API_KEY is not configured.");
  }

  return apiKey;
};

const request = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);

  if (!response.ok) {
    const data = await response.json().catch(() => null);

    const message =
      data?.error?.message ?? "Unable to communicate with YouTube.";

    throw new Error(message);
  }

  return response.json();
};

export const extractYoutubePlaylistId = (value: string) => {
  const input = value.trim();

  if (!input) {
    throw new Error("Enter a playlist ID.");
  }

  /*
   * Accepts:
   *
   * PLxxxxxxxx
   *
   * https://youtube.com/playlist?list=PLxxxxxxxx
   *
   * https://www.youtube.com/watch?v=xxx&list=PLxxxxxxxx
   */

  try {
    const url = new URL(input);

    const playlistId = url.searchParams.get("list");

    if (playlistId) {
      return playlistId;
    }
  } catch {
    // It's probably just the playlist ID.
  }

  if (/^[a-zA-Z0-9_-]+$/.test(input)) {
    return input;
  }

  throw new Error("Invalid YouTube playlist ID.");
};

interface YoutubePlaylistResponse {
  items: Array<{
    id: string;

    snippet: {
      title: string;
      description: string;
      channelTitle: string;

      thumbnails?: {
        default?: {
          url: string;
        };

        medium?: {
          url: string;
        };

        high?: {
          url: string;
        };

        standard?: {
          url: string;
        };

        maxres?: {
          url: string;
        };
      };
    };

    contentDetails: {
      itemCount: number;
    };
  }>;
}

interface YoutubePlaylistItemsResponse {
  nextPageToken?: string;

  items: Array<{
    snippet: {
      title: string;
      position: number;
      channelTitle: string;
      videoOwnerChannelTitle?: string;

      thumbnails?: {
        default?: {
          url: string;
        };

        medium?: {
          url: string;
        };

        high?: {
          url: string;
        };

        standard?: {
          url: string;
        };

        maxres?: {
          url: string;
        };
      };

      resourceId?: {
        videoId?: string;
      };
    };

    contentDetails?: {
      videoId?: string;
    };
  }>;
}

const getThumbnail = (
  thumbnails:
    | YoutubePlaylistResponse["items"][number]["snippet"]["thumbnails"]
    | YoutubePlaylistItemsResponse["items"][number]["snippet"]["thumbnails"],
) => {
  return (
    thumbnails?.maxres?.url ??
    thumbnails?.standard?.url ??
    thumbnails?.high?.url ??
    thumbnails?.medium?.url ??
    thumbnails?.default?.url ??
    ""
  );
};

const getPlaylistInfo = async (playlistId: string) => {
  const apiKey = getApiKey();

  const params = new URLSearchParams({
    part: "snippet,contentDetails",
    id: playlistId,
    key: apiKey,
  });

  const data = await request<YoutubePlaylistResponse>(
    `${API_URL}/playlists?${params}`,
  );

  const playlist = data.items[0];

  if (!playlist) {
    throw new Error("Playlist not found or unavailable.");
  }

  return playlist;
};

const getPlaylistVideos = async (playlistId: string) => {
  const apiKey = getApiKey();

  const videos: YoutubeVideo[] = [];

  let nextPageToken: string | undefined;

  do {
    const params = new URLSearchParams({
      part: "snippet,contentDetails",
      playlistId,
      maxResults: "50",
      key: apiKey,
    });

    if (nextPageToken) {
      params.set("pageToken", nextPageToken);
    }

    const data = await request<YoutubePlaylistItemsResponse>(
      `${API_URL}/playlistItems?${params}`,
    );

    const pageVideos = data.items
      .map((item): YoutubeVideo | null => {
        const videoId =
          item.contentDetails?.videoId ?? item.snippet.resourceId?.videoId;

        if (!videoId) {
          return null;
        }

        /*
         * Deleted/private videos sometimes come back
         * without useful information.
         */
        if (
          item.snippet.title === "Deleted video" ||
          item.snippet.title === "Private video"
        ) {
          return null;
        }

        return {
          id: videoId,
          title: item.snippet.title,
          thumbnail:
            getThumbnail(item.snippet.thumbnails) ||
            `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          channelTitle:
            item.snippet.videoOwnerChannelTitle ?? item.snippet.channelTitle,
          position: item.snippet.position,
        };
      })
      .filter((video): video is YoutubeVideo => video !== null);

    videos.push(...pageVideos);

    nextPageToken = data.nextPageToken;
  } while (nextPageToken);

  return videos.sort((a, b) => a.position - b.position);
};

export const fetchYoutubePlaylist = async (
  value: string,
): Promise<YoutubePlaylist> => {
  const playlistId = extractYoutubePlaylistId(value);

  const [playlist, videos] = await Promise.all([
    getPlaylistInfo(playlistId),
    getPlaylistVideos(playlistId),
  ]);

  return {
    id: playlist.id,

    title: playlist.snippet.title,

    description: playlist.snippet.description,

    thumbnail: getThumbnail(playlist.snippet.thumbnails),

    channelTitle: playlist.snippet.channelTitle,

    itemCount: videos.length,

    videos,

    addedAt: new Date().toISOString(),
  };
};
