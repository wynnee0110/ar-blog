"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient"; 
import Link from "next/link";
import { Loader2, Heart, MessageCircle, Share2, User, ArrowRight, X } from "lucide-react";
// 1. Imports for Modal
import LikeButton from "@/app/components/LikeButton";
import CommentButton from "@/app/components/CommentButton";
import CommentModal from "@/app/components/CommentModal";
import UserBadge from "@/app/components/UserBadge";

// --- CHILD COMPONENT ---
function SearchContent() {
  const searchParams = useSearchParams(); 
  const query = searchParams.get("q"); 
  
  const [posts, setPosts] = useState<any[]>([]);
  const [people, setPeople] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 2. Modal States
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user));

    const fetchResults = async () => {
      setLoading(true);
      
      if (!query) {
        setPosts([]);
        setPeople([]);
        setLoading(false);
        return;
      }

      const [postsResult, peopleResult] = await Promise.all([
        supabase
          .from("posts")
          // 👇 REVERTED TO SIMPLE QUERY (Removed likes/comments count to fix error)
          .select(`*, author:profiles(username, full_name, avatar_url, badge, border_variant)`)
          .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
          .order("created_at", { ascending: false }),

        supabase
          .from("profiles")
          .select("*")
          .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
          .limit(5)
      ]);

      if (postsResult.error) console.error("Post search error:", postsResult.error);
      else setPosts(postsResult.data || []);

      if (peopleResult.error) console.error("People search error:", peopleResult.error);
      else setPeople(peopleResult.data || []);

      setLoading(false);
    };

    fetchResults();
  }, [query]);

  // 3. Modal Handlers
  const openPostModal = (post: any) => {
    setSelectedPost(post);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closePostModal = () => {
    setIsModalOpen(false);
    setSelectedPost(null);
    document.body.style.overflow = "unset";
  };

  return (
    <div className="w-full max-w-lg mt-10 mb-24">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        Results for: <span className="text-cyan-500 dark:text-cyan-400">"{query}"</span>
      </h1>

      {loading && (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-cyan-500" size={32} />
        </div>
      )}

      {!loading && posts.length === 0 && people.length === 0 && (
        <div className="text-center py-10 bg-white dark:bg-[#252836] rounded-2xl border border-gray-200 dark:border-gray-700 border-dashed transition-colors duration-300">
          <p className="text-gray-500">No results found.</p>
        </div>
      )}

      <div className="flex flex-col gap-8">
        {/* --- PEOPLE RESULTS --- */}
        {!loading && people.length > 0 && (
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">People</h3>
            {people.map((person) => (
              <Link href={`/user/${person.id}`} key={person.id}>
                <div className="bg-white dark:bg-[#252836] p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-cyan-500/50 dark:hover:border-cyan-500/50 hover:bg-gray-50 dark:hover:bg-[#2f3343] transition-all flex items-center justify-between group cursor-pointer duration-300">
                  <div className="flex items-center gap-3">
                    <div className={`avatar-wrapper border-${person.border_variant || 'none'}`}>
                      {person.avatar_url ? (
                        <img src={person.avatar_url} alt="Av" className="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-gray-600" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold">
                          {person.username?.[0]?.toUpperCase() || <User size={20} />}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-gray-900 dark:text-white font-bold text-sm group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors flex items-center gap-1">
                        {person.full_name || "User"}
                        <UserBadge badge={person.badge} />
                      </h4>
                      <p className="text-gray-500 text-xs">@{person.username}</p>
                    </div>
                  </div>
                  <ArrowRight size={18} className="text-gray-400 group-hover:text-cyan-500 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* --- POST RESULTS (OPENS MODAL) --- */}
        {!loading && posts.length > 0 && (
          <div className="flex flex-col gap-4">
             {people.length > 0 && <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Posts</h3>}
            {posts.map((post) => (
              <div 
                key={post.id} 
                onClick={() => openPostModal(post)}
                className="bg-white dark:bg-[#252836] p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:border-cyan-500/50 dark:hover:border-cyan-500/50 transition-all duration-300 cursor-pointer group"
              >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`avatar-wrapper border-${post.author?.border_variant || 'none'}`}>
                      {post.author?.avatar_url ? (
                        <img src={post.author.avatar_url} alt="Av" className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-600" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                          {post.author?.username?.[0] || "?"}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-gray-900 dark:text-white font-semibold text-sm group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors flex items-center gap-1">
                        {post.author?.full_name || "Unknown User"}
                        <UserBadge badge={post.author?.badge} />
                      </h4>
                      <p className="text-gray-500 text-xs">
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    {post.title && <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{post.title}</h2>}
                    <p className="text-gray-700 dark:text-gray-300 text-[15px] leading-relaxed whitespace-pre-wrap">{post.content}</p>
                    {post.image_url && (
                        <div className="mt-3 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700">
                        <img src={post.image_url} alt="post" className="w-full h-auto object-contain bg-gray-50 dark:bg-black/20 max-h-96" />
                        </div>
                    )}
                  </div>

                  <div className="flex items-center gap-6 pt-4 border-t border-gray-100 dark:border-gray-700 text-gray-500">
                    <div className="flex items-center gap-2 group-hover:text-pink-500 transition">
                      <Heart size={18} />
                      {/* Removed failing count query */}
                      <span className="text-xs font-semibold">Like</span> 
                    </div>
                    <div className="flex items-center gap-2 group-hover:text-blue-400 transition">
                      <MessageCircle size={18} />
                      <span className="text-xs font-semibold">Comment</span>
                    </div>
                    <Share2 size={18} className="ml-auto group-hover:text-green-400 transition" />
                  </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- FULL POST MODAL --- */}
      {isModalOpen && selectedPost && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={closePostModal} />
          
          <div className="relative bg-white dark:bg-[#252836] w-full max-w-2xl h-[92vh] sm:h-auto sm:max-h-[85vh] flex flex-col rounded-t-[2.5rem] sm:rounded-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 border border-gray-200 dark:border-gray-700">
            
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <Link href={`/user/${selectedPost.author_id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className={`avatar-wrapper border-${selectedPost.author?.border_variant || 'none'}`}>
                  <img src={selectedPost.author?.avatar_url || ""} alt="" className="w-8 h-8 rounded-full object-cover border-2 border-white dark:border-[#252836]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold dark:text-white leading-tight flex items-center gap-1">
                    {selectedPost.author?.full_name}
                    <UserBadge badge={selectedPost.author?.badge} />
                  </span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-tighter">@{selectedPost.author?.username}</span>
                </div>
              </Link>
              
              <button 
                onClick={closePostModal} 
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-900 dark:text-white transition-transform active:scale-90 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 sm:p-8 custom-scrollbar bg-white dark:bg-[#252836]">
              {selectedPost.title && <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-4 leading-tight break-words">{selectedPost.title}</h1>}
              <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg leading-relaxed whitespace-pre-wrap break-words mb-6">{selectedPost.content}</p>
              {selectedPost.image_url && (
                <img src={selectedPost.image_url} alt="full" className="w-full h-auto object-contain bg-gray-50 dark:bg-black/20 rounded-2xl border border-gray-100 dark:border-gray-700" />
              )}
            </div>

            <div className="p-5 bg-white dark:bg-[#252836] border-t border-gray-200 dark:border-gray-700 sm:rounded-b-[2rem] flex items-center justify-between">
              <div className="flex items-center gap-6">
                <LikeButton postId={selectedPost.id} currentUserId={currentUser?.id} />
                <CommentButton postId={selectedPost.id} onClick={() => { closePostModal(); setActiveCommentId(selectedPost.id); }} />
              </div>
              <button className="text-gray-500 hover:text-cyan-500 transition-colors"><Share2 size={20} /></button>
            </div>
          </div>
        </div>
      )}

      {/* --- COMMENT MODAL --- */}
      {activeCommentId && (
        <CommentModal 
          postId={activeCommentId} 
          currentUserId={currentUser?.id} 
          onClose={() => setActiveCommentId(null)} 
        />
      )}

    </div>
  );
}

// --- MAIN PAGE COMPONENT ---
export default function SearchPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#0f1117] text-gray-900 dark:text-gray-200 p-4 flex flex-col items-center transition-colors duration-300">
      <Suspense 
        fallback={
          <div className="flex justify-center items-center h-[50vh]">
            <Loader2 className="animate-spin text-cyan-500" size={32} />
          </div>
        }
      >
        <SearchContent />
      </Suspense>
    </main>
  );
}