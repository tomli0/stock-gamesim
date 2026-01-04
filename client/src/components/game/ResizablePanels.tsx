import { useState, useRef, useEffect, useCallback, ReactNode } from "react";
import { getLocalStorage, setLocalStorage } from "@/lib/utils";

const STORAGE_KEY = "ui.marketWidth";
const MIN_WIDTH_PERCENT = 20;
const MAX_WIDTH_PERCENT = 70;
const DEFAULT_DESKTOP_WIDTH = 45;
const DEFAULT_MOBILE_WIDTH = 35;
const SPLITTER_WIDTH = 12;

interface ResizablePanelsProps {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
}

export default function ResizablePanels({ leftPanel, rightPanel }: ResizablePanelsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  
  const getDefaultWidth = () => {
    if (typeof window !== "undefined" && window.innerWidth <= 820) {
      return DEFAULT_MOBILE_WIDTH;
    }
    return DEFAULT_DESKTOP_WIDTH;
  };
  
  const loadSavedWidth = (): number => {
    const saved = getLocalStorage(STORAGE_KEY);
    if (saved !== null && saved !== undefined) {
      const numValue = Number(saved);
      if (!isNaN(numValue)) {
        return Math.max(MIN_WIDTH_PERCENT, Math.min(MAX_WIDTH_PERCENT, numValue));
      }
    }
    return getDefaultWidth();
  };
  
  const [leftWidthPercent, setLeftWidthPercent] = useState(loadSavedWidth);
  const [isResizing, setIsResizing] = useState(false);
  
  useEffect(() => {
    const handleResize = () => {
      const saved = getLocalStorage(STORAGE_KEY);
      if (!saved) {
        setLeftWidthPercent(getDefaultWidth());
      }
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  const saveWidth = useCallback((width: number) => {
    setLocalStorage(STORAGE_KEY, width);
  }, []);
  
  const handleDrag = useCallback((clientX: number) => {
    if (!containerRef.current || !isDragging.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const containerWidth = rect.width;
    const relativeX = clientX - rect.left;
    
    let newPercent = (relativeX / containerWidth) * 100;
    newPercent = Math.max(MIN_WIDTH_PERCENT, Math.min(MAX_WIDTH_PERCENT, newPercent));
    
    setLeftWidthPercent(newPercent);
  }, []);
  
  const handleDragEnd = useCallback(() => {
    if (isDragging.current) {
      isDragging.current = false;
      setIsResizing(false);
      saveWidth(leftWidthPercent);
    }
  }, [leftWidthPercent, saveWidth]);
  
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    setIsResizing(true);
  }, []);
  
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    isDragging.current = true;
    setIsResizing(true);
  }, []);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging.current) {
        handleDrag(e.clientX);
      }
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging.current && e.touches.length > 0) {
        handleDrag(e.touches[0].clientX);
      }
    };
    
    const handleMouseUp = () => handleDragEnd();
    const handleTouchEnd = () => handleDragEnd();
    
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("touchend", handleTouchEnd);
    
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleDrag, handleDragEnd]);
  
  const handleDoubleClick = useCallback(() => {
    const newWidth = leftWidthPercent < 15 ? getDefaultWidth() : 10;
    setLeftWidthPercent(newWidth);
    saveWidth(newWidth);
  }, [leftWidthPercent, saveWidth]);
  
  return (
    <div 
      ref={containerRef}
      className="flex h-full w-full overflow-hidden"
      style={{ 
        cursor: isResizing ? "col-resize" : undefined,
        userSelect: isResizing ? "none" : undefined 
      }}
    >
      <div 
        className="h-full overflow-hidden flex-shrink-0"
        style={{ width: `calc(${leftWidthPercent}% - ${SPLITTER_WIDTH / 2}px)` }}
      >
        {leftPanel}
      </div>
      
      <div
        className="h-full flex-shrink-0 flex items-center justify-center cursor-col-resize group touch-none"
        style={{ width: `${SPLITTER_WIDTH}px` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onDoubleClick={handleDoubleClick}
      >
        <div className="w-px h-full bg-slate-700 group-hover:bg-blue-500 transition-colors relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
            <div className="w-1 h-1 rounded-full bg-slate-500 group-hover:bg-blue-400" />
            <div className="w-1 h-1 rounded-full bg-slate-500 group-hover:bg-blue-400" />
            <div className="w-1 h-1 rounded-full bg-slate-500 group-hover:bg-blue-400" />
          </div>
        </div>
      </div>
      
      <div 
        className="h-full overflow-hidden flex-1 min-w-0"
      >
        {rightPanel}
      </div>
    </div>
  );
}
