"use client";

import { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
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
      className="hit-target w-9 h-9 flex items-center justify-center bg-white border border-sand rounded-full shadow-game-flat hover:border-forest transition-colors active:scale-90 flex-shrink-0"
      aria-label={muted ? "Bật âm thanh" : "Tắt âm thanh"}
      title={muted ? "Bật âm thanh" : "Tắt âm thanh"}
      type="button"
    >
      {muted ? <VolumeX size={16} className="text-gray-400" /> : <Volume2 size={16} className="text-gray-500" />}
    </button>
  );
}
