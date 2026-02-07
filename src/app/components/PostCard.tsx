"use client";

import { useState, useEffect, useRef } from "react";
import UserBadge from "./UserBadge";
import Link from "next/link";
import { Share2, X, MoreHorizontal, Trash2, Edit3 } from 'lucide-react';
import LikeButton from "./LikeButton";
import CommentButton from "./CommentButton"; 

export type Post = {
  id: string;
  title: string | null;
  content: string;
  image_url?: string | null;
  author_id: string;
  created_at: string;
  author?: {
    username: string;
    full_name: string;
    avatar_url: string | null;
    border_variant?: string | null;
    badge?: string | null;
  };
};

type PostCardProps = {
  post: Post;
  currentUserId?: string;
  onDelete?: (postId: string) => void;
  onEdit?: (post: Post) => void;
  onCommentClick: (postId: string) => void;
};

export default function PostCard({ post, currentUserId, onDelete, onEdit, onCommentClick }: PostCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const isMyPost = currentUserId === post.author_id;
  const displayName = post.author?.full_name || post.author?.username || "User";
  const borderVariant = post.author?.border_variant || 'none';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setShowMenu(false);
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isModalOpen]);

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a") || target.closest(".action-zone") || target.closest(".menu-container")) return;
    setIsModalOpen(true);
  };

  const feedTitle = post.title && post.title.length > 52 ? post.title.substring(0, 52) + "..." : post.title;
  const feedContent = post.content.length > 120 ? post.content.substring(0, 120) + "..." : post.content;

  const ActionMenu = () => (
    <div className="menu-container relative action-zone" ref={menuRef}>
      <button 
        onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500"
      >
        <MoreHorizontal size={20} />
      </button>

      {showMenu && isMyPost && (
        <div 
          className="absolute right-0 mt-2 w-40 bg-white dark:bg-[#252836] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-[150] overflow-hidden animate-in fade-in zoom-in-95 duration-100"
          onClick={(e) => e.stopPropagation()} 
        >
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit?.(post); setShowMenu(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Edit3 size={16} /> Edit Post
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete?.(post.id); setShowMenu(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 size={16} /> Delete Post
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* --- FEED CARD VIEW --- */}
      <div 
        onClick={handleCardClick}
        // CHANGED: dark:bg-[#252836] (Lighter than background) and dark:border-gray-700 (Visible border)
        className="bg-white dark:bg-[#252836] p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all cursor-pointer active:scale-[0.99] group overflow-visible duration-300"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Link href={`/user/${post.author_id}`} onClick={(e) => e.stopPropagation()}>
              <div className={`avatar-wrapper border-${borderVariant}`}>
                <img src={post.author?.avatar_url || ""} alt="" className="w-9 h-9 rounded-full object-cover border-2 border-white dark:border-[#252836]" />
              </div>
            </Link>
            <div className="flex flex-col ">
              <span className="text-gray-900 dark:text-white font-semibold text-sm flex items-center gap-0">
                {displayName}
                <UserBadge badge={post.author?.badge} size = {16} />
              </span>
            </div>
          </div>
          {!isModalOpen && <ActionMenu />}
        </div>

        <div className="mb-3">
          {feedTitle && <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1 leading-tight break-words">{feedTitle}</h2>}
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed break-words">{feedContent}</p>
          {post.image_url && (
            <div className="mt-3 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700">
              <img src={post.image_url} alt="post" className="w-full h-auto object-contain transition-transform duration-500" />
            </div>
          )}
        </div>

        <div className="action-zone flex items-center gap-5 pt-3 border-t border-gray-100 dark:border-gray-700 mt-2">
          <LikeButton postId={post.id} currentUserId={currentUserId} />
          <div onClick={(e) => e.stopPropagation()}>
            <CommentButton postId={post.id} onClick={() => onCommentClick(post.id)} />
          </div>
        </div>
      </div>

      {/* --- FULL POST MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => {setIsModalOpen(false); setShowMenu(false);}} />
          
          {/* CHANGED: Modal background to match card (#252836) */}
          <div className="relative bg-white dark:bg-[#252836] w-full max-w-2xl h-[92vh] sm:h-auto sm:max-h-[85vh] flex flex-col rounded-t-[2.5rem] sm:rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <Link href={`/user/${post.author_id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className={`avatar-wrapper border-${borderVariant}`}>
                  <img src={post.author?.avatar_url || ""} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-white dark:border-[#252836]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold dark:text-white leading-tight flex items-center gap-1">
                    {displayName}
                    <UserBadge badge={post.author?.badge} />
                  </span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-tighter">@{post.author?.username}</span>
                </div>
              </Link>
              
              <div className="flex items-center gap-2">
                <ActionMenu />
                <button 
                  onClick={() => {setIsModalOpen(false); setShowMenu(false);}} 
                  className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-900 dark:text-white transition-transform active:scale-90 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 sm:p-8 custom-scrollbar bg-white dark:bg-[#252836]">
              {post.title && <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-4 leading-tight break-words">{post.title}</h1>}
              <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg leading-relaxed whitespace-pre-wrap break-words mb-6">{post.content}</p>
              {post.image_url && <img src={post.image_url} alt="full" className="w-full h-auto object-contain bg-gray-50 dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-gray-700" />}
            </div>

            <div className="p-5 bg-white dark:bg-[#252836] border-t border-gray-200 dark:border-gray-700 sm:rounded-b-[2rem] flex items-center justify-between">
              <div className="flex items-center gap-6">
                <LikeButton postId={post.id} currentUserId={currentUserId} />
                <CommentButton postId={post.id} onClick={() => { setIsModalOpen(false); onCommentClick(post.id); }} />
              </div>
              <button className="text-gray-500 hover:text-cyan-500 transition-colors"><Share2 size={20} /></button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}