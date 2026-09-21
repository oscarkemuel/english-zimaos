import { useEffect, useMemo, useState } from "react";

import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";


import useYoutubePlaylists from "@/hooks/useYoutubePlaylists";

import type { YoutubePlaylist, YoutubeVideo } from "@/types/youtube";

import {
  CheckCircle2,
  Circle,
  Home,
  ListVideo,
  Plus,
} from "lucide-react";
import AddYoutubePlaylistModal from "@/lib/AddYoutubePlaylistModal";
import { EmptyState } from "./-components/EmptyState";
import { PlaylistCard } from "./-components/PlaylistCard";
import { VideoItem } from "./-components/VideoItem";

export const Route = createFileRoute("/youtube/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  const {
    playlists,
    addPlaylist,
    refreshPlaylist,
    removePlaylist,
    isVideoWatched,
    toggleVideoWatched,
    getWatchedCount,
    getProgress,
  } = useYoutubePlaylists();

  const [addPlaylistOpen, setAddPlaylistOpen] = useState(false);

  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(
    null,
  );

  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);

  const [refreshingPlaylistId, setRefreshingPlaylistId] = useState<
    string | null
  >(null);

  const selectedPlaylist = useMemo(
    () =>
      playlists.find((playlist) => playlist.id === selectedPlaylistId) ?? null,
    [playlists, selectedPlaylistId],
  );

  const currentVideo = useMemo(() => {
    if (!selectedPlaylist) {
      return null;
    }

    return (
      selectedPlaylist.videos.find((video) => video.id === currentVideoId) ??
      null
    );
  }, [selectedPlaylist, currentVideoId]);

  useEffect(() => {
    if (!playlists.length) {
      setSelectedPlaylistId(null);
      setCurrentVideoId(null);
      return;
    }

    const selectedStillExists = playlists.some(
      (playlist) => playlist.id === selectedPlaylistId,
    );

    if (!selectedStillExists) {
      setSelectedPlaylistId(playlists[0].id);
    }
  }, [playlists, selectedPlaylistId]);

  useEffect(() => {
    if (!selectedPlaylist) {
      setCurrentVideoId(null);
      return;
    }

    const currentStillExists = selectedPlaylist.videos.some(
      (video) => video.id === currentVideoId,
    );

    if (currentStillExists) {
      return;
    }

    const firstUnwatched = selectedPlaylist.videos.find(
      (video) => !isVideoWatched(selectedPlaylist.id, video.id),
    );

    setCurrentVideoId(
      firstUnwatched?.id ?? selectedPlaylist.videos[0]?.id ?? null,
    );
  }, [selectedPlaylist, currentVideoId, isVideoWatched]);

  const handleBack = () => {
    navigate({
      to: "/",
    });
  };

  const handlePlaylistAdded = async (value: string) => {
    const playlist = await addPlaylist(value);

    setSelectedPlaylistId(playlist.id);

    const firstVideo = playlist.videos[0];

    if (firstVideo) {
      setCurrentVideoId(firstVideo.id);
    }

    return playlist;
  };

  const handleOpenPlaylist = (playlist: YoutubePlaylist) => {
    setSelectedPlaylistId(playlist.id);

    const firstUnwatched = playlist.videos.find(
      (video) => !isVideoWatched(playlist.id, video.id),
    );

    setCurrentVideoId(firstUnwatched?.id ?? playlist.videos[0]?.id ?? null);
  };

  const handleSelectVideo = (video: YoutubeVideo) => {
    setCurrentVideoId(video.id);
  };

  const handleRefresh = async (playlistId: string) => {
    try {
      setRefreshingPlaylistId(playlistId);

      await refreshPlaylist(playlistId);
    } finally {
      setRefreshingPlaylistId(null);
    }
  };

  const handleDelete = (playlistId: string) => {
    removePlaylist(playlistId);

    if (selectedPlaylistId === playlistId) {
      setSelectedPlaylistId(null);
      setCurrentVideoId(null);
    }
  };

  return (
    <>
      <div className="dark min-h-screen bg-background text-foreground p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4 max-w-2xl">
              <Button
                variant="ghost"
                className="pl-0 text-zinc-400 hover:text-zinc-50 hover:bg-transparent w-fit mb-3"
                onClick={handleBack}
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>

              <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
                YouTube Playlist Player
              </h1>

              <p className="text-zinc-400">
                Watch your YouTube playlists and keep track of your progress.
              </p>
            </div>

            <Button
              variant="ghost"
              onClick={() => setAddPlaylistOpen(true)}
              className="text-zinc-400 hover:text-zinc-50 hover:bg-transparent w-fit transition-all"
            >
              <Plus className="w-5 h-5 mr-1" />
              Add Playlist
            </Button>
          </div>

          {playlists.length === 0 ? (
            <EmptyState onAdd={() => setAddPlaylistOpen(true)} />
          ) : (
            <>
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <ListVideo className="w-5 h-5 text-zinc-500" />

                  <h2 className="font-medium text-zinc-200">Playlists</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {playlists.map((playlist) => (
                    <PlaylistCard
                      key={playlist.id}
                      playlist={playlist}
                      selected={selectedPlaylistId === playlist.id}
                      watchedCount={getWatchedCount(playlist.id)}
                      progress={getProgress(playlist)}
                      refreshing={refreshingPlaylistId === playlist.id}
                      onOpen={() => handleOpenPlaylist(playlist)}
                      onRefresh={() => handleRefresh(playlist.id)}
                      onDelete={() => handleDelete(playlist.id)}
                    />
                  ))}
                </div>
              </section>

              {selectedPlaylist && (
                <section className="pt-3 space-y-6">
                  <div className="border-t border-zinc-900 pt-8">
                    <p className="text-xs uppercase tracking-wider text-zinc-600 mb-2">
                      Now watching
                    </p>

                    <h2 className="text-2xl font-semibold text-zinc-100">
                      {selectedPlaylist.title}
                    </h2>

                    <p className="text-sm text-zinc-500 mt-1">
                      {selectedPlaylist.channelTitle}
                    </p>
                  </div>

                  {currentVideo && (
                    <div className="space-y-4">
                      <div className="aspect-video overflow-hidden rounded-xl border border-zinc-800 bg-black">
                        <iframe
                          key={currentVideo.id}
                          src={`https://www.youtube.com/embed/${currentVideo.id}?rel=0`}
                          title={currentVideo.title}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="font-medium text-zinc-100 truncate">
                            {currentVideo.title}
                          </h3>

                          <p className="text-sm text-zinc-500">
                            {currentVideo.channelTitle}
                          </p>
                        </div>

                        <Button
                          variant="outline"
                          onClick={() =>
                            toggleVideoWatched(
                              selectedPlaylist.id,
                              currentVideo.id,
                            )
                          }
                          className="border-zinc-800 bg-zinc-950 text-zinc-300 hover:text-zinc-50 hover:bg-zinc-900 shrink-0"
                        >
                          {isVideoWatched(
                            selectedPlaylist.id,
                            currentVideo.id,
                          ) ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Watched
                            </>
                          ) : (
                            <>
                              <Circle className="w-4 h-4 mr-2" />
                              Mark as watched
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-zinc-200">Videos</h3>

                      <span className="text-xs text-zinc-500">
                        {getWatchedCount(selectedPlaylist.id)}/
                        {selectedPlaylist.videos.length} watched
                      </span>
                    </div>

                    <div className="space-y-2">
                      {selectedPlaylist.videos.map((video, index) => (
                        <VideoItem
                          key={video.id}
                          video={video}
                          index={index}
                          active={video.id === currentVideoId}
                          watched={isVideoWatched(
                            selectedPlaylist.id,
                            video.id,
                          )}
                          onPlay={() => handleSelectVideo(video)}
                          onToggleWatched={() =>
                            toggleVideoWatched(selectedPlaylist.id, video.id)
                          }
                        />
                      ))}
                    </div>
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>

      <AddYoutubePlaylistModal
        open={addPlaylistOpen}
        onOpenChange={setAddPlaylistOpen}
        onAdd={handlePlaylistAdded}
      />
    </>
  );
}
