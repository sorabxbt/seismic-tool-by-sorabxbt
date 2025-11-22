import React, { useEffect, useRef } from 'react';
import { SLIDER_IMAGES } from '../constants';

export const CircularSlider: React.FC = () => {
  return (
    <section className="relative w-full overflow-hidden py-4 group">
      <div className="flex items-center justify-between mb-4 px-4">
        <h2 className="text-lg font-semibold text-white">Community Creations</h2>
        <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">Live Feed</span>
      </div>

      <div className="relative flex overflow-hidden">
         {/* Fades */}
        <div className="absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-[#0b1020] to-transparent pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-[#0b1020] to-transparent pointer-events-none"></div>

        {/* Track */}
        <div className="flex gap-4 animate-[csliderScroll_40s_linear_infinite] group-hover:[animation-play-state:paused] w-max pl-4">
          {/* Original Set */}
          {SLIDER_IMAGES.map((src, i) => (
            <SliderItem key={`orig-${i}`} src={src} />
          ))}
          {/* Clone 1 for seamless loop */}
          {SLIDER_IMAGES.map((src, i) => (
            <SliderItem key={`clone1-${i}`} src={src} />
          ))}
          {/* Clone 2 for extra safety on wide screens */}
          {SLIDER_IMAGES.map((src, i) => (
            <SliderItem key={`clone2-${i}`} src={src} />
          ))}
        </div>
      </div>
      
      <style>{`
        @keyframes csliderScroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-33.33%); } 
        }
      `}</style>
    </section>
  );
};

const SliderItem: React.FC<{ src: string }> = ({ src }) => (
  <div className="flex-shrink-0 w-[100px] h-[100px] md:w-[120px] md:h-[120px] rounded-xl overflow-hidden shadow-lg border border-slate-700/50 hover:scale-105 transition-transform duration-300 cursor-pointer">
    <img src={src} alt="Gallery" className="w-full h-full object-cover" />
  </div>
);