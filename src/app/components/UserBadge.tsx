import { BadgeCheck, ShieldAlert, Star } from "lucide-react";

type BadgeType = 'verified' | 'admin' | 'pro' | null | string;

// 1. Add 'size' to the props definition (Default is 16)
export default function UserBadge({ badge, size = 16 }: { badge?: BadgeType; size?: number }) {
  if (!badge) return null;

  switch (badge) {
    case 'verified':
      return (
        <div title="Verified User" className="inline-flex items-center justify-center ml-1">
          {/* 2. Pass the size prop to the icon */}
          <BadgeCheck size={size} className="fill-blue-500 text-white" />
        </div>
      );
    
    case 'admin':
      return (
        <div title="Admin" className="inline-flex items-center justify-center ml-1">
          <ShieldAlert size={size} className="fill-red-600 text-white" />
        </div>
      );

    case 'pro':
      return (
        <div title="Pro Member" className="inline-flex items-center justify-center ml-1">
          <Star size={size} className="fill-yellow-500 text-white" />
        </div>
      );

    default:
      return null;
  }
}