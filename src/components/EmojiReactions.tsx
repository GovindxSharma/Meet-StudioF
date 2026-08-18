import React, { useEffect, useState } from 'react';

export interface FloatingReaction {
  id: string;
  emoji: string;
  sender: string;
  xPos: number; // percentage across screen (10% to 90%)
  createdAt: number;
}

interface EmojiReactionsOverlayProps {
  reactions: FloatingReaction[];
}

export const EmojiReactionsOverlay: React.FC<EmojiReactionsOverlayProps> = ({ reactions }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden select-none">
      {reactions.map((r) => (
        <ReactionParticle key={r.id} reaction={r} />
      ))}
    </div>
  );
};

const ReactionParticle: React.FC<{ reaction: FloatingReaction }> = ({ reaction }) => {
  const [style, setStyle] = useState({
    bottom: '80px',
    left: `${reaction.xPos}%`,
    opacity: 1,
    transform: 'scale(0.8) translateY(0) rotate(0deg)',
    transition: 'transform 2.8s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 2.8s ease-out',
  });

  useEffect(() => {
    // Trigger float animation on mount
    const timer = setTimeout(() => {
      const randomRotation = Math.floor(Math.random() * 40) - 20;
      const randomY = Math.floor(Math.random() * 200) + 400; // float up 400-600px
      const randomXOffset = Math.floor(Math.random() * 60) - 30; // sway left/right
      
      setStyle({
        bottom: '80px',
        left: `calc(${reaction.xPos}% + ${randomXOffset}px)`,
        opacity: 0,
        transform: `scale(1.4) translateY(-${randomY}px) rotate(${randomRotation}deg)`,
        transition: 'transform 2.8s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 2.8s ease-out',
      });
    }, 20);

    return () => clearTimeout(timer);
  }, [reaction]);

  return (
    <div
      style={style}
      className="absolute flex flex-col items-center gap-1 z-40 will-change-transform"
    >
      <span className="text-3xl sm:text-4xl filter drop-shadow-lg">{reaction.emoji}</span>
      {reaction.sender && (
        <span className="bg-[#202124]/90 border border-[#3c4043] text-white text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap shadow-md">
          {reaction.sender}
        </span>
      )}
    </div>
  );
};

export const EMOJI_LIST = ['💖', '👍', '🎉', '👏', '😂', '😮', '😢', '🤔'];
