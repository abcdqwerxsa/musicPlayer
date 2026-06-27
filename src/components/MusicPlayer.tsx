import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Repeat1, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Track } from '@/types/music';
import { cn } from '@/lib/utils';
import { PlaybackMode } from '@/hooks/usePlaylist'; // Import PlaybackMode type

interface MusicPlayerControls {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  audioRef: React.RefObject<HTMLAudioElement>;
  togglePlayPause: () => void;
  handleSeek: (time: number) => void;
  handleVolumeChange: (newVolume: number) => void;
  toggleMute: () => void;
}

interface PlaylistControls {
  playNextTrack: () => void;
  playPreviousTrack: () => void;
  playbackMode: PlaybackMode;
  setPlaybackMode: (mode: PlaybackMode) => void;
  togglePlaybackMode: () => void; // Added new toggle function
}

interface MusicPlayerProps extends MusicPlayerControls, PlaylistControls {
  track: Track | null;
}

const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const MusicPlayer: React.FC<MusicPlayerProps> = ({ 
  track, 
  isPlaying, 
  currentTime, 
  duration, 
  volume, 
  isMuted, 
  audioRef, 
  togglePlayPause, 
  handleSeek, 
  handleVolumeChange, 
  toggleMute,
  playNextTrack,
  playPreviousTrack,
  playbackMode,
  // setPlaybackMode, // Removed direct use of setPlaybackMode
  togglePlaybackMode, // Use the new toggle function
}) => {

  const handleSliderSeek = (value: number[]) => {
    handleSeek(value[0]);
  };

  const handleSliderVolumeChange = (value: number[]) => {
    // Convert slider value (0-100) to volume (0-1)
    handleVolumeChange(value[0] / 100);
  };
  
  const getModeIcon = () => {
    switch (playbackMode) {
      case 'loop':
        return { Icon: Repeat, title: '列表循环', className: 'text-primary' };
      case 'repeat-one':
        return { Icon: Repeat1, title: '单曲循环', className: 'text-primary' };
      case 'sequential':
      default:
        // Use ArrowRight to signify playing through the list once and stopping
        return { Icon: ArrowRight, title: '顺序播放', className: 'text-muted-foreground/70' };
    }
  };
  
  const { Icon: ModeIcon, title: modeTitle, className: modeClassName } = getModeIcon();

  if (!track) {
    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl z-50 rounded-2xl glass-panel shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10">
        <div className="flex items-center justify-center p-4 h-20">
          <p className="text-muted-foreground text-sm tracking-wide">在上方媒体库选择一首歌曲开始播放 🎵</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl z-50 rounded-2xl glass-panel shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 p-4 md:py-3 md:px-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
        
        {/* 隐藏的 HTML5 播放器音频元素 */}
        <audio
          ref={audioRef}
          preload="metadata"
        />

        {/* 歌曲基本信息 (左侧) */}
        <div className="flex items-center w-full md:w-1/4 min-w-0 group justify-between md:justify-start">
          <div className="flex items-center min-w-0">
            {/* 迷你黑胶旋转缩影 */}
            <div 
              className={cn(
                "h-11 w-11 rounded-full bg-gradient-to-tr from-zinc-900 to-zinc-950 mr-3 flex items-center justify-center relative border border-white/10 shadow-lg flex-shrink-0 transition-transform ease-out",
                isPlaying ? "animate-vinyl" : ""
              )}
              style={{ transitionDuration: '6000ms' }}
            >
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center relative overflow-hidden">
                <div className="w-1.5 h-1.5 bg-[#07070a] rounded-full border border-zinc-800" />
              </div>
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold text-white truncate group-hover:text-primary transition-colors duration-300">
                {track.title}
              </p>
              <p className="text-xs text-muted-foreground/75 truncate mt-0.5">{track.artist}</p>
            </div>
          </div>
        </div>

        {/* 播放控制与进度条 (中间) */}
        <div className="flex flex-col items-center w-full md:w-1/2 px-0 md:px-4">
          
          {/* 控制按钮组 */}
          <div className="flex space-x-6 mb-2.5 items-center">
            
            {/* 播放模式切换 */}
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                "h-8 w-8 hover:bg-white/5 active:scale-95 transition-all text-muted-foreground hover:text-white rounded-full",
                modeClassName
              )}
              onClick={togglePlaybackMode}
              title={modeTitle}
            >
              <ModeIcon className="h-4.5 w-4.5" />
            </Button>

            {/* 上一首 */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 hover:bg-white/5 text-muted-foreground hover:text-white active:scale-95 transition-all rounded-full"
              onClick={playPreviousTrack}
            >
              <SkipBack className="h-4.5 w-4.5 fill-current" />
            </Button>
            
            {/* 播放/暂停大圆钮 */}
            <Button 
              variant="default" 
              size="icon" 
              className="h-11 w-11 rounded-full bg-gradient-to-tr from-primary to-indigo-500 text-white shadow-[0_4px_15px_rgba(120,119,198,0.45)] hover:opacity-95 active:scale-95 transition-all border border-white/10"
              onClick={togglePlayPause}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 fill-current text-white" />
              ) : (
                <Play className="h-5 w-5 fill-current text-white translate-x-0.5" />
              )}
            </Button>
            
            {/* 下一首 */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 hover:bg-white/5 text-muted-foreground hover:text-white active:scale-95 transition-all rounded-full"
              onClick={playNextTrack}
            >
              <SkipForward className="h-4.5 w-4.5 fill-current" />
            </Button>
            
            {/* 空白占位符（可用于未来扩展） */}
            <div className="h-8 w-8"></div> 
          </div>

          {/* 歌曲播放进度条 */}
          <div className="flex items-center w-full space-x-3 group/slider">
            <span className="text-[10px] font-mono text-muted-foreground/80 w-8 text-right">{formatTime(currentTime)}</span>
            <div className="flex-1 py-1">
              <Slider
                value={[currentTime]}
                max={duration || 0}
                step={0.1}
                onValueChange={handleSliderSeek}
                className="cursor-pointer"
                disabled={duration === 0}
              />
            </div>
            <span className="text-[10px] font-mono text-muted-foreground/80 w-8 text-left">{formatTime(duration)}</span>
          </div>
        </div>

        {/* 音量大小调节 (右侧) */}
        <div className="hidden md:flex items-center justify-end w-1/4 space-x-2 group/volume">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-white/5 rounded-full transition-all" 
            onClick={toggleMute}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          <div className="w-20 py-1">
            <Slider
              value={[isMuted ? 0 : volume * 100]}
              max={100}
              step={1}
              onValueChange={handleSliderVolumeChange}
              className="cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;