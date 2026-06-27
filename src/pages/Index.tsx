import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchTracksFromR2 } from '@/api/music';
import { Track } from '@/types/music';
import { usePlaylist } from '@/hooks/usePlaylist';
import MusicPlayer from '@/components/MusicPlayer';
import LyricsDisplay from '@/components/LyricsDisplay';
import TrackList from '@/components/TrackList';
import UploadForm from '@/components/UploadForm';
import VinylRecord from '@/components/VinylRecord';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle, Upload, Cloud } from 'lucide-react';

// Component to render the Upload Dialog/Button
const UploadDialog = ({ onUploadSuccess }: { onUploadSuccess: () => void }) => {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  
  return (
    <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="shadow-md">
          <Upload className="w-4 h-4 mr-2" />
          上传曲目
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>上传新曲目</DialogTitle>
        </DialogHeader>
        <UploadForm onUploadSuccess={onUploadSuccess} />
      </DialogContent>
    </Dialog>
  );
};


const Index: React.FC = () => {
  const queryClient = useQueryClient();
  
  // Fetch tracks using React Query
  const { data: tracks = [], isLoading, error } = useQuery<Track[]>({
    queryKey: ['tracks'],
    queryFn: fetchTracksFromR2,
  });

  // Initialize playlist controls
  const { 
    currentTrack, 
    currentTrackIndex, 
    playerControls, 
    selectTrackByIndex,
    playNextTrack, 
    playPreviousTrack, 
    playbackMode, 
    setPlaybackMode, 
    togglePlaybackMode, 
  } = usePlaylist(tracks);

  
  const handleSelectTrack = (track: Track) => {
    const index = tracks.findIndex(t => t.id === track.id);
    if (index !== -1) {
      // If selecting a new track, set it and start playing
      if (currentTrack?.id !== track.id) {
        selectTrackByIndex(index);
        // The usePlaylist hook will handle the play state transition
      } else {
        // If selecting the current track, toggle play/pause
        playerControls.togglePlayPause();
      }
    }
  };
  
  const handleUploadSuccess = () => {
    // Invalidate the tracks query to refetch the list, showing the new track
    queryClient.invalidateQueries({ queryKey: ['tracks'] });
  };

  // --- Common Header Content ---
  const headerContent = (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-white/5 gap-4 relative z-10">
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center gap-1.5 backdrop-blur-md tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
            CLOUDFLARE POWERED
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tighter text-white mt-2 bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
          Aura Music Console
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">沉浸式歌词同步音乐播放中心</p>
      </div>
      <UploadDialog onUploadSuccess={handleUploadSuccess} />
    </header>
  );
  // -----------------------------


  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07070a] flex flex-col items-center p-4 relative overflow-hidden">
        {/* Ambient Aurora Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none animate-aurora-1" />
        <div className="w-full max-w-6xl space-y-6 pt-8 relative z-10">
          {headerContent}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5">
              <Skeleton className="h-96 w-full rounded-2xl bg-zinc-900/60" />
            </div>
            <div className="lg:col-span-7 space-y-6">
              <Skeleton className="h-64 w-full rounded-2xl bg-zinc-900/60" />
              <Skeleton className="h-48 w-full rounded-2xl bg-zinc-900/60" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#07070a] flex flex-col items-center p-4 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-red-500/5 blur-[120px] pointer-events-none" />
        <div className="w-full max-w-6xl space-y-6 pt-8 relative z-10">
          {headerContent}
          <Alert variant="destructive" className="bg-red-950/20 border-red-500/30 text-red-200 rounded-2xl backdrop-blur-md">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <AlertTitle className="font-bold text-red-400">Error Loading Tracks</AlertTitle>
            <AlertDescription className="text-red-300/90 mt-1 text-sm">
              获取音乐曲目失败。请确保您的 Cloudflare Worker API 正常运行，并且在环境变量中正确配置了 VITE_WORKER_API_URL。
              <p className="mt-2 font-mono text-xs text-red-400/80">错误细节: {error.message}</p>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07070a] flex flex-col justify-center items-center p-4 md:p-8 pb-36 relative overflow-hidden">
      {/* Dynamic Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-indigo-500/5 blur-[130px] animate-aurora-1" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-purple-500/5 blur-[130px] animate-aurora-2" />
      </div>

      <div className="w-full max-w-6xl space-y-6 relative z-10">
        {headerContent}
        
        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Interactive Lyrics (Sticky and Prominent on Desktop) */}
          <div className="lg:col-span-8 lg:sticky lg:top-8 z-10">
            <Card className="glass-panel border-none rounded-2xl overflow-hidden shadow-2xl">
              <CardHeader className="p-5 pb-0 border-b border-white/5 bg-white/[0.01]">
                <CardTitle className="text-base font-bold text-white/95 tracking-wide flex items-center justify-between">
                  <span>实时动态歌词</span>
                  {currentTrack && (
                    <span className="text-xs font-medium text-primary/80 bg-primary/10 px-2.5 py-0.5 rounded-full">
                      同步中
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {currentTrack && currentTrack.lyrics ? (
                  <LyricsDisplay 
                    lrcContent={currentTrack.lyrics} 
                    currentTime={playerControls.currentTime} 
                    onSeek={playerControls.handleSeek}
                  />
                ) : (
                  <div className="h-[460px] flex items-center justify-center text-muted-foreground text-sm">
                    暂无可播放的歌词信息。
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Mini Vinyl Indicator & Media Library */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Miniature Vinyl Ornament Player */}
            <VinylRecord 
              track={currentTrack} 
              isPlaying={playerControls.isPlaying} 
            />

            {/* Track List Card */}
            <Card className="glass-panel border-none rounded-2xl shadow-2xl overflow-hidden">
              <CardHeader className="p-5 pb-2 border-b border-white/5 bg-white/[0.01]">
                <CardTitle className="text-base font-bold text-white/95 flex items-center justify-between">
                  <span>媒体库列表</span>
                  <span className="text-xs text-muted-foreground bg-white/5 px-2.5 py-0.5 rounded-full font-medium">
                    共 {tracks?.length || 0} 首歌曲
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="max-h-[260px] overflow-y-auto custom-scrollbar pr-1">
                  {tracks && (
                    <TrackList 
                      tracks={tracks} 
                      onSelectTrack={handleSelectTrack} 
                      currentTrackId={currentTrack?.id || null}
                      isPlaying={playerControls.isPlaying}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Floating Pill Music Player */}
      <MusicPlayer 
        track={currentTrack} 
        {...playerControls} 
        playNextTrack={playNextTrack}
        playPreviousTrack={playPreviousTrack}
        playbackMode={playbackMode}
        setPlaybackMode={setPlaybackMode}
        togglePlaybackMode={togglePlaybackMode}
      />
    </div>
  );
};

export default Index;