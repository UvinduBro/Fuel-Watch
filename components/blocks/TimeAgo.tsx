"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface TimeAgoProps {
  dateString: string;
}

export function TimeAgo({ dateString }: TimeAgoProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function formatTimeAgo(str: string) {
    if (str === "No Data" || !str) return "No data";
    const date = new Date(str);
    if (isNaN(date.getTime())) return str;
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    // Fallback for future dates or slight clock drift
    if (seconds < 0) return "just now";

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " mins ago";
    return "just now";
  }

  if (!mounted) {
    return (
      <div className="text-[10px] text-muted-foreground flex items-center gap-1 ml-1 opacity-0">
        <Clock className="w-3 h-3" />
        ...
      </div>
    );
  }

  return (
    <div className="text-[10px] text-muted-foreground flex items-center gap-1 ml-1">
      <Clock className="w-3 h-3" />
      {formatTimeAgo(dateString)}
    </div>
  );
}
