"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { X, Trash2, Loader2 } from "lucide-react"; // Added Trash2
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/app/lib/supabaseClient"; // Import Supabase

type StoryViewerProps = {
  storyGroups: any[][]; 
  initialGroupIndex: number; 
  onClose: () => void;
  currentUserId?: string; // NEW PROP
  onStoryDeleted?: () => void; // NEW PROP (to refresh feed)
};

export default function StoryViewerModal({ 
  storyGroups, 
  initialGroupIndex, 
  onClose,
  currentUserId,
  onStoryDeleted
}: StoryViewerProps) {
  
  // Track BOTH the current user (group) and the current story
  const [currentGroupIndex, setCurrentGroupIndex] = useState(initialGroupIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // NEW STATE
  
  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const elapsedTimeRef = useRef<number>(0);
  const pointerDownTimeRef = useRef<number>(0);
  
  const STORY_DURATION = 5000;

  // Get the active list of stories for the current user
  const currentGroup = storyGroups[currentGroupIndex];
  const currentStory = currentGroup?.[currentStoryIndex];

  // --- DELETE LOGIC ---
 const handleDelete = async (e: React.MouseEvent) => {
  e.stopPropagation();
  setIsPaused(true);
  
  if (!confirm("Delete this story permanently?")) {
    setIsPaused(false);
    return;
  }

  setIsDeleting(true);

  try {
    // 1. Try to delete the file (Ignore errors if file doesn't exist)
    const fileName = currentStory.image_url.split('/').pop();
    if (fileName) {
      await supabase.storage.from('stories').remove([fileName]);
    }

    // 2. Delete from Database (This is the critical part)
    const { error } = await supabase
      .from('stories')
      .delete()
      .eq('id', currentStory.id);

    if (error) {
      console.error("Supabase Error:", error);
      throw error;
    }

    // 3. Success! Update UI
    if (onStoryDeleted) onStoryDeleted();
    
    // Close modal if it was the last story, otherwise go next
    if (currentGroup.length <= 1) {
      onClose();
    } else {
      // Force a slight delay to ensure UI doesn't glitch
      setTimeout(() => goToNext(), 100);
    }
    
  } catch (error: any) {
    console.error("Delete failed:", error);
    alert(`Delete failed: ${error.message || "Unknown error"}`);
    setIsDeleting(false);
    setIsPaused(false);
  }
};

  // Reset progress when switching stories OR groups
  useEffect(() => {
    setProgress(0);
    elapsedTimeRef.current = 0;
    startTimeRef.current = null;
    setIsPaused(false);
    setIsDeleting(false);
  }, [currentGroupIndex, currentStoryIndex]);

  // --- NAVIGATION LOGIC ---
  const goToNext = useCallback(() => {
    elapsedTimeRef.current = 0;
    setProgress(0);

    // 1. Is there another story in THIS user's group?
    if (currentStoryIndex < currentGroup.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
    } 
    // 2. If not, is there another USER group?
    else if (currentGroupIndex < storyGroups.length - 1) {
      setCurrentGroupIndex(prev => prev + 1);
      setCurrentStoryIndex(0); 
    } 
    // 3. No more stories, no more users. Close.
    else {
      onClose();
    }
  }, [currentStoryIndex, currentGroupIndex, currentGroup?.length, storyGroups.length, onClose]);

  const goToPrev = useCallback(() => {
    elapsedTimeRef.current = 0;
    setProgress(0);

    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
    } 
    else if (currentGroupIndex > 0) {
      const prevGroupIndex = currentGroupIndex - 1;
      setCurrentGroupIndex(prevGroupIndex);
      setCurrentStoryIndex(storyGroups[prevGroupIndex].length - 1);
    } 
    else {
      startTimeRef.current = null;
    }
  }, [currentStoryIndex, currentGroupIndex, storyGroups]);

  // --- ANIMATION LOOP ---
  useEffect(() => {
    const animate = (timestamp: number) => {
      // Pause if user is interacting OR if deleting
      if (isPaused || isDeleting) {
        startTimeRef.current = null;
        requestRef.current = requestAnimationFrame(animate);
        return;
      }
      if (startTimeRef.current === null) startTimeRef.current = timestamp - elapsedTimeRef.current;
      const elapsed = timestamp - startTimeRef.current;
      elapsedTimeRef.current = elapsed;

      const newProgress = Math.min((elapsed / STORY_DURATION) * 100, 100);
      setProgress(newProgress);

      if (elapsed < STORY_DURATION) {
        requestRef.current = requestAnimationFrame(animate);
      } else {
        goToNext();
      }
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [isPaused, isDeleting, goToNext]);

  // --- INTERACTION HANDLERS ---
  const handlePointerDown = () => {
    if (isDeleting) return;
    setIsPaused(true);
    pointerDownTimeRef.current = Date.now();
  };

  const handlePointerUp = (action: 'next' | 'prev') => {
    if (isDeleting) return;
    setIsPaused(false);
    if (Date.now() - pointerDownTimeRef.current < 200) {
      if (action === 'next') goToNext();
      if (action === 'prev') goToPrev();
    }
  };

  if (!currentStory) return null;

  // Check if this is my story
  const isMyStory = currentUserId === currentStory.author_id;

  return (
    <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center animate-in zoom-in-95 duration-200">
      <div className="relative w-full max-w-md h-full sm:h-[90vh] sm:rounded-2xl overflow-hidden bg-gray-900 shadow-2xl flex flex-col select-none">
        
        {/* PROGRESS BAR */}
        <div className="absolute top-4 left-2 right-2 z-30 flex gap-1 h-1">
          {currentGroup.map((_, index) => (
            <div key={index} className="flex-1 bg-white/30 rounded-full overflow-hidden h-full">
              <div 
                className="h-full bg-white transition-all ease-linear"
                style={{ 
                  width: index === currentStoryIndex ? `${progress}%` : 
                         index < currentStoryIndex ? '100%' : '0%'
                }} 
              />
            </div>
          ))}
        </div>

        {/* HEADER */}
        <div className="absolute top-8 left-4 right-16 z-30 flex items-center gap-3 pointer-events-none">
          <img src={currentStory.author?.avatar_url || "/default-avatar.png"} className="w-8 h-8 rounded-full border border-white/20 object-cover bg-gray-700" />
          <div className="flex flex-col drop-shadow-md">
             <span className="text-white font-bold text-sm truncate">{currentStory.author?.username || "User"}</span>
             <span className="text-white/80 text-[10px]">
               {currentStory.created_at ? formatDistanceToNow(new Date(currentStory.created_at), { addSuffix: true }) : "Just now"}
             </span>
          </div>
        </div>

        {/* CONTROLS (Close & Delete) */}
        <div className="absolute top-8 right-4 z-50 flex items-center gap-3">
          {/* DELETE BUTTON (Only if My Story) */}
          {isMyStory && (
            <button 
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 text-white bg-black/20 hover:bg-red-500/80 rounded-full backdrop-blur-sm transition-colors"
            >
              {isDeleting ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
            </button>
          )}

          {/* CLOSE BUTTON */}
          <button 
            onClick={onClose} 
            className="p-2 text-white bg-black/20 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* NAVIGATION ZONES */}
        <div className="absolute inset-0 z-20 flex">
           <div className="flex-1 h-full cursor-pointer" onPointerDown={handlePointerDown} onPointerUp={() => handlePointerUp('prev')} onPointerLeave={() => setIsPaused(false)} />
           <div className="flex-1 h-full cursor-pointer" onPointerDown={handlePointerDown} onPointerUp={() => handlePointerUp('next')} onPointerLeave={() => setIsPaused(false)} />
        </div>

        {/* IMAGE */}
        <img 
          src={currentStory.image_url} 
          className="w-full h-full object-contain bg-black pointer-events-none" 
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        
        {/* PAUSE INDICATOR */}
        {isPaused && !isDeleting && (
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
             <div className="bg-black/40 px-4 py-2 rounded-full text-white text-xs backdrop-blur-md">Paused</div>
          </div>
        )}
      </div>
    </div>
  );
}