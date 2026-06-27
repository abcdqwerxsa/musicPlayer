import React from 'react';
import { Track } from '@/types/music';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrackListProps {
  tracks: Track[];
  onSelectTrack: (track: Track) => void;
  currentTrackId: string | null;
  isPlaying: boolean;
}

const TrackList: React.FC<TrackListProps> = ({ tracks, onSelectTrack, currentTrackId, isPlaying }) => {
  
  // 渲染音轨序号或跳动均衡器指示器
  const renderIndicator = (index: number, isActive: boolean, isPlaying: boolean) => {
    if (isActive && isPlaying) {
      return (
        <div className="flex items-end gap-[2.5px] h-3.5 w-5 justify-center mr-4 mb-[2px] flex-shrink-0">
          <div className="w-[2.5px] h-full bg-primary rounded-full animate-eq-bar" style={{ animationDelay: '0.1s', animationDuration: '0.7s' }} />
          <div className="w-[2.5px] h-full bg-primary rounded-full animate-eq-bar" style={{ animationDelay: '0.4s', animationDuration: '1.0s' }} />
          <div className="w-[2.5px] h-full bg-primary rounded-full animate-eq-bar" style={{ animationDelay: '0.2s', animationDuration: '0.8s' }} />
        </div>
      );
    }
    
    if (isActive && !isPlaying) {
      return (
        <div className="flex items-end gap-[2.5px] h-3.5 w-5 justify-center mr-4 mb-[2px] flex-shrink-0">
          <div className="w-[2.5px] h-1.5 bg-primary rounded-full" />
          <div className="w-[2.5px] h-1 bg-primary rounded-full" />
          <div className="w-[2.5px] h-2 bg-primary rounded-full" />
        </div>
      );
    }

    return (
      <span className="text-xs font-mono text-muted-foreground/40 w-5 mr-4 text-center block flex-shrink-0">
        {(index + 1).toString().padStart(2, '0')}
      </span>
    );
  };

  return (
    <div className="divide-y divide-white/5">
      {tracks.map((track, index) => {
        const isActive = currentTrackId === track.id;
        
        return (
          <div 
            key={track.id} 
            className={cn(
              "flex items-center justify-between py-3 px-4 rounded-xl cursor-pointer transition-all duration-300 group",
              isActive 
                ? 'bg-white/[0.04] border border-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' 
                : 'hover:bg-white/[0.02] border border-transparent hover:translate-x-1.5'
            )}
            onClick={() => onSelectTrack(track)}
          >
            <div className="flex items-center min-w-0 flex-1 pr-4">
              {/* 指示器 */}
              {renderIndicator(index, isActive, isPlaying)}
              
              <div className="min-w-0">
                <p className={cn(
                  "text-sm font-semibold truncate transition-colors duration-300",
                  isActive ? "text-primary" : "text-white/90 group-hover:text-white"
                )}>
                  {track.title}
                </p>
                <p className="text-xs text-muted-foreground/75 truncate mt-0.5">{track.artist}</p>
              </div>
            </div>

            {/* 播放操作圆纽 */}
            <Button 
              size="icon" 
              variant="ghost"
              className={cn(
                "h-8 w-8 rounded-full border border-white/5 shadow-sm active:scale-90 transition-all flex-shrink-0",
                isActive 
                  ? "bg-primary hover:bg-primary/95 text-white hover:text-white border-transparent" 
                  : "bg-white/[0.02] hover:bg-white/10 text-muted-foreground hover:text-white"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onSelectTrack(track);
              }}
            >
              {isActive && isPlaying ? (
                <Pause className="h-3.5 w-3.5 fill-current" />
              ) : (
                <Play className="h-3.5 w-3.5 fill-current translate-x-0.5" />
              )}
            </Button>
          </div>
        );
      })}
    </div>
  );
};

export default TrackList;