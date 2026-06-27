import React, { useMemo, useRef, useEffect } from 'react';
import { parseLRC } from '@/lib/lrcParser';
import { cn } from '@/lib/utils';

interface LyricsDisplayProps {
  lrcContent: string;
  currentTime: number;
  onSeek?: (time: number) => void;
}

// 布局计算常量 (需与 Tailwind 样式匹配)
const CONTAINER_HEIGHT_PX = 460; // h-[460px]
const LINE_HEIGHT_PX = 36; // 对应行高

const LyricsDisplay: React.FC<LyricsDisplayProps> = ({ lrcContent, currentTime, onSeek }) => {
  const parsedLyrics = useMemo(() => parseLRC(lrcContent), [lrcContent]);
  const activeLineRef = useRef<HTMLParagraphElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 查找当前处于活动状态的歌词索引
  const activeIndex = useMemo(() => {
    let index = -1;
    for (let i = 0; i < parsedLyrics.length; i++) {
      if (parsedLyrics[i].time <= currentTime) {
        index = i;
      } else {
        break;
      }
    }
    return index;
  }, [currentTime, parsedLyrics]);

  if (!lrcContent || parsedLyrics.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground text-sm tracking-wider">
        暂无歌词信息
      </div>
    );
  }

  // 计算居中对齐的 Y 轴平移偏移量
  const centerOffset = (CONTAINER_HEIGHT_PX / 2) - (LINE_HEIGHT_PX / 2);
  const translateY = activeIndex * LINE_HEIGHT_PX - centerOffset;
  
  const transformStyle: React.CSSProperties = {
    transform: `translateY(${-translateY}px)`,
    transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)', 
  };

  const handleLineClick = (time: number) => {
    if (onSeek) {
      onSeek(time);
    }
  };

  return (
    // 外层容器：固定高度，超出隐藏，采用高质感底色
    <div ref={containerRef} className="h-[460px] overflow-hidden relative bg-[#0c0c0f]/80 select-none">
      {/* 内层容器：应用平滑的垂直平移动画 */}
      <div 
        className="flex flex-col items-center w-full py-4"
        style={transformStyle}
      >
        {parsedLyrics.map((line, index) => {
          const isActive = index === activeIndex;
          return (
            <p
              key={index}
              ref={isActive ? activeLineRef : null}
              onClick={() => handleLineClick(line.time)}
              className={cn(
                "px-6 text-center h-[36px] flex items-center justify-center transition-all duration-300 whitespace-nowrap max-w-full font-medium text-base",
                isActive
                  ? 'text-white font-extrabold text-lg scale-105 drop-shadow-[0_0_12px_rgba(139,92,246,0.65)]' 
                  : 'text-muted-foreground/30 hover:text-white/80 cursor-pointer hover:scale-102 hover:opacity-80'
              )}
            >
              {line.text}
            </p>
          );
        })}
      </div>
      
      {/* 顶部和底部的磨砂玻璃渐变叠加罩，实现歌词淡入淡出消融效果 */}
      <div className="absolute top-0 left-0 right-0 h-1/5 bg-gradient-to-b from-[#0c0c0f] to-transparent pointer-events-none z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-1/5 bg-gradient-to-t from-[#0c0c0f] to-transparent pointer-events-none z-10" />
    </div>
  );
};

export default LyricsDisplay;