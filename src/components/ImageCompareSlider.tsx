"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface ImageCompareSliderProps {
  beforeImage: string;
  afterImage: string;
}

export default function ImageCompareSlider({ beforeImage, afterImage }: ImageCompareSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  };

  const handleMouseDown = () => setIsDragging(true);

  useEffect(() => {
    const handleMouseUpGlobal = () => setIsDragging(false);
    const handleMouseMoveGlobal = (e: MouseEvent) => {
      if (isDragging) handleMove(e.clientX);
    };
    const handleTouchMoveGlobal = (e: TouchEvent) => {
      if (isDragging) handleMove(e.touches[0].clientX);
    };

    if (isDragging) {
      window.addEventListener("mouseup", handleMouseUpGlobal);
      window.addEventListener("mousemove", handleMouseMoveGlobal);
      window.addEventListener("touchend", handleMouseUpGlobal);
      window.addEventListener("touchmove", handleTouchMoveGlobal);
    }

    return () => {
      window.removeEventListener("mouseup", handleMouseUpGlobal);
      window.removeEventListener("mousemove", handleMouseMoveGlobal);
      window.removeEventListener("touchend", handleMouseUpGlobal);
      window.removeEventListener("touchmove", handleTouchMoveGlobal);
    };
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-4xl mx-auto h-[400px] md:h-[600px] overflow-hidden rounded-2xl shadow-2xl cursor-col-resize select-none"
      onMouseDown={handleMouseDown}
      onTouchStart={() => setIsDragging(true)}
    >
      {/* Before Image (Back) */}
      <Image
        src={beforeImage}
        alt="Before"
        fill
        className="object-cover absolute inset-0 z-0 pointer-events-none"
        priority
        unoptimized
      />

      {/* After Image (Front, Clipped) */}
      <div
        className="absolute inset-0 z-10 overflow-hidden pointer-events-none"
        style={{ width: `${sliderPosition}%` }}
      >
        <div className="relative w-full h-full" style={{ width: containerRef.current?.offsetWidth || 800 }}>
          <Image
            src={afterImage}
            alt="After"
            fill
            className="object-cover absolute inset-0 max-w-none w-full pointer-events-none"
            priority
            unoptimized
          />
        </div>
      </div>

      {/* Slider Button */}
      <div
        className="absolute top-0 bottom-0 z-20 w-1 bg-white cursor-col-resize shadow-[0_0_10px_rgba(0,0,0,0.5)]"
        style={{ left: `${sliderPosition}%`, transform: "translateX(-50%)" }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white text-zinc-800 rounded-full shadow-lg flex items-center justify-center pointer-events-auto">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          <svg
            className="rotate-180"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </div>
      </div>
      
      {/* Labels */}
      <div className="absolute bottom-4 left-4 z-20 px-3 py-1 bg-black/50 backdrop-blur-md rounded border border-white/20 text-white/90 text-sm font-medium tracking-wide">
        Final Gerado
      </div>
      <div className="absolute bottom-4 right-4 z-0 px-3 py-1 bg-black/50 backdrop-blur-md rounded border border-white/20 text-white/90 text-sm font-medium tracking-wide">
        Sua Foto
      </div>
    </div>
  );
}
