"use client";

import { useState, useEffect } from "react";
import { isMuted, toggleMuted, playSound } from "@/lib/sound";

/** Small round mute/unmute button for the top status bar. */
export default function SoundToggle() {
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setMuted(isMuted());
  }, []);

  const handleToggle = () => {
    const next = toggleMuted();
    setMuted(next);
    if (!next) playSound("complete"); // audible confirmation when unmuting
  };

  return (
    <button
      onClick={handleToggle}
      className="flex items-center justify-center p-1.5 bg-white border-2 border-sand rounded-full shadow-game-flat hover:border-forest transition-colors text-xs active:scale-90"
      title={muted ? "Bật âm thanh" : "Tắt âm thanh"}
      type="button"
    >
      {muted ? "🔇" : "🔊"}
    </button>
  );
}
