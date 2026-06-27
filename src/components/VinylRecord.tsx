import React from 'react';
import { Track } from '@/types/music';
import { Disc, Music } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VinylRecordProps {
  track: Track | null;
  isPlaying: boolean;
}

const VinylRecord: React.FC<VinylRecordProps> = ({ track, isPlaying }) => {
  return (
    <div className="glass-panel rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden min-h-[240px] group transition-all duration-500 hover:border-white/15">
      {/* 唱片机背景光晕 (缩小) */}
      <div className={cn(
        "absolute w-32 h-32 rounded-full blur-[60px] opacity-15 -z-10 transition-all duration-1000",
        isPlaying ? "bg-primary scale-110" : "bg-primary/30 scale-100"
      )} />

      {/* 唱机托盘区域 (缩小) */}
      <div className="relative w-44 h-44 flex items-center justify-center">
        
        {/* 拟物黑胶唱盘 (缩小至直径 160px/w-40) */}
        <div 
          className={cn(
            "w-40 h-40 rounded-full bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-950 shadow-[0_15px_35px_rgba(0,0,0,0.6)] flex items-center justify-center relative border-[3px] border-zinc-950/80 transition-transform ease-out",
            isPlaying ? "animate-vinyl" : ""
          )}
          style={{
            transitionDuration: '4000ms',
            // 环形光影，重现胶片黑胶同心圆质感
            backgroundImage: `
              radial-gradient(circle, transparent 30%, rgba(255,255,255,0.02) 30%, rgba(255,255,255,0.02) 31%, transparent 31%, transparent 33%, rgba(255,255,255,0.015) 33%, rgba(255,255,255,0.015) 34%, transparent 34%),
              radial-gradient(circle, #18181b 10%, #09090b 80%)
            `
          }}
        >
          {/* 唱片同心内圆圈 (缩小) */}
          <div className="absolute inset-2 rounded-full border border-zinc-800/30" />
          <div className="absolute inset-4 rounded-full border border-zinc-800/20" />
          <div className="absolute inset-6 rounded-full border border-zinc-800/10" />
          <div className="absolute inset-8 rounded-full border border-zinc-800/5" />

          {/* 唱片中心彩色封面/标贴 (缩小至 w-14) */}
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary/30 via-indigo-500/20 to-purple-500/40 flex items-center justify-center border-[3px] border-zinc-900/60 shadow-inner overflow-hidden relative">
            {track ? (
              <div className="text-center p-1">
                <Music className="w-4 h-4 mx-auto text-primary/80 animate-pulse" />
              </div>
            ) : (
              <Disc className="w-5 h-5 text-muted-foreground/40" />
            )}
            
            {/* 唱片中心轴小孔 */}
            <div className="absolute w-3.5 h-3.5 bg-[#07070a] rounded-full border border-zinc-850 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]" />
          </div>
        </div>

        {/* 拟物唱臂 (Tonearm) (等比缩小) */}
        <div 
          className="absolute top-1 right-4 w-16 h-22 origin-[85%_15%] transition-transform duration-700 ease-in-out pointer-events-none z-10"
          style={{
            transform: isPlaying ? 'rotate(15deg)' : 'rotate(-18deg)',
          }}
        >
          {/* 唱臂轴心金属盘 */}
          <div className="absolute top-0 right-1 w-6 h-6 rounded-full bg-gradient-to-b from-zinc-700 to-zinc-900 border border-zinc-650 shadow-md flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-zinc-500 shadow-inner" />
          </div>
          
          {/* 金属唱杆 */}
          <div className="absolute top-3 right-3 w-1.5 h-16 bg-gradient-to-r from-zinc-400 to-zinc-500 origin-top rotate-[12deg] shadow-sm rounded-full" />
          
          {/* 唱针头 */}
          <div className="absolute bottom-1.5 left-4 w-2 h-4 bg-zinc-800 border border-zinc-700 rounded-sm shadow-md rotate-[25deg]">
            {/* 蓝色小光点指示灯 */}
            <div className={cn(
              "w-1 h-1 rounded-full mx-auto mt-0.5 transition-colors duration-500",
              isPlaying ? "bg-emerald-400 shadow-[0_0_6px_#34d399]" : "bg-zinc-600"
            )} />
          </div>
        </div>
      </div>

      {/* 歌曲信息与声波微动效 (紧凑型) */}
      <div className="w-full text-center mt-3 z-10">
        {track ? (
          <div className="space-y-2">
            <div className="truncate px-2">
              <h3 className="text-sm font-bold text-white/90 tracking-tight truncate group-hover:text-primary transition-colors duration-300">
                {track.title}
              </h3>
              <p className="text-[11px] text-muted-foreground/80 mt-0.5 truncate">
                {track.artist}
              </p>
            </div>

            {/* 精美声波图 (缩小高度为 h-5) */}
            <div className="flex items-end justify-center gap-1 h-5 pt-1">
              {[0.4, 0.8, 0.6, 0.9, 0.5, 0.75, 0.4, 0.65, 0.85, 0.5].map((speed, i) => (
                <div 
                  key={i}
                  className={cn(
                    "w-[3px] rounded-full bg-gradient-to-t from-primary/50 to-primary transition-all duration-300",
                    isPlaying ? "animate-eq-bar" : "h-1"
                  )}
                  style={{
                    height: isPlaying ? '100%' : '4px',
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: `${1 / speed}s`
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-xs text-muted-foreground/60 py-2">
            播放挂件未就绪
          </div>
        )}
      </div>
    </div>
  );
};

export default VinylRecord;
