"use client";

import Link from "next/link";
import { Share2, MoreHorizontal, Trash2 } from 'lucide-react';
import LikeButton from "./LikeButton";
import CommentButton from "./CommentButton";

// 👇 UPDATE THIS TYPE DEFINITION
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
    border_variant?: string | null; // <--- ADD THIS LINE
  };
};

type PostCardProps = {
  post: Post;
  currentUserId?: string;
  onDelete?: (postId: string) => void;
  onCommentClick: (postId: string) => void;
};

export default function PostCard({ post, currentUserId, onDelete, onCommentClick }: PostCardProps) {
  
  const isMyPost = currentUserId === post.author_id;
  const displayName = post.author?.full_name || post.author?.username || "User";
  const displayInitial = displayName[0]?.toUpperCase() || "U";
  
  // Get the variant (default to 'none' if missing)
  const borderVariant = post.author?.border_variant || 'none';

  return (
    <div className="bg-white dark:bg-[#1e212b] p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all group animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          
          {/* Avatar with Animated Border */}
          <Link href={`/user/${post.author_id}`}>
            <div className="relative group/avatar cursor-pointer">
              
              {/* 👇 WRAPPER FOR BORDER ANIMATION */}
              <div className={`avatar-wrapper border-${borderVariant}`}>
                {post.author?.avatar_url ? (
                  <img 
                    src={post.author.avatar_url} 
                    alt="Avatar" 
                    className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-[#1e212b]" 
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-lg transition group-hover/avatar:ring-2 ring-cyan-500/50 border-2 border-white dark:border-[#1e212b]">
                    {displayInitial}
                  </div>
                )}
              </div>

            </div>
          </Link>

          {/* Name & Date */}
          <div>
            <Link href={`/user/${post.author_id}`}>
              <h4 className="text-gray-900 dark:text-white font-semibold text-sm hover:text-cyan-500 transition cursor-pointer flex items-center gap-2">
                {displayName}
                {isMyPost && (
                  <span className="text-[10px] bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 px-1.5 py-0.5 rounded-full border border-cyan-500/20">
                    Author
                  </span>
                )}
              </h4>
            </Link>
            <p className="text-gray-500 text-xs">
              {new Date(post.created_at).toLocaleDateString(undefined, {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        {/* Delete / Menu Button */}
        <div className="relative">
           {isMyPost && onDelete ? (
              <button 
                onClick={() => onDelete(post.id)}
                className="text-gray-500 hover:text-red-500 transition p-2 hover:bg-red-500/10 rounded-full"
                title="Delete Post"
              >
                <Trash2 size={18} />
              </button>
           ) : (
              <button className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition p-2">
                <MoreHorizontal size={20} />
              </button>
           )}
        </div>
      </div>

      {/* --- CONTENT --- */}
      <div className="mb-4">
        {post.title && (
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 leading-tight">
            {post.title}
          </h2>
        )}
        
        <p className="text-gray-700 dark:text-gray-300 text-[15px] leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>

        {/* Image Attachment */}
        {post.image_url && (
          <div className="mt-3 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 relative bg-gray-100 dark:bg-black/50">
            <img 
              src={post.image_url} 
              alt="Post attachment" 
              className="w-full h-auto object-cover max-h-[500px]"
              loading="lazy"
            />
          </div>
        )}
      </div>

      {/* --- ACTIONS --- */}
      <div className="flex items-center gap-6 pt-4 border-t border-gray-200 dark:border-gray-800 text-gray-500">
        <LikeButton postId={post.id} currentUserId={currentUserId} />
        
        <CommentButton 
          postId={post.id} 
          onClick={() => onCommentClick(post.id)} 
        />
        
        <button className="flex items-center gap-2 text-sm hover:text-green-500 transition ml-auto">
          <Share2 size={18} />
        </button>
      </div>

    </div>
  );
}