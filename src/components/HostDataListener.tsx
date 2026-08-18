import React, { useEffect } from 'react';
import { useRoomContext, useLocalParticipant } from '@livekit/components-react';
import { soundManager } from '../utils/soundUtils';
import type { FloatingReaction } from './EmojiReactions';
import type { ChatMessage } from './InCallChatDrawer';

interface HostDataListenerProps {
  onKicked?: () => void;
  onRoomEnded?: () => void;
  onReceiveReaction?: (reaction: FloatingReaction) => void;
  onReceiveChatMessage?: (msg: ChatMessage) => void;
  onReceiveHandRaise?: (identity: string, isRaised: boolean) => void;
  onReceiveDrawEvent?: (drawData: any) => void;
}

export const HostDataListener: React.FC<HostDataListenerProps> = ({
  onKicked,
  onRoomEnded,
  onReceiveReaction,
  onReceiveChatMessage,
  onReceiveHandRaise,
  onReceiveDrawEvent,
}) => {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();

  useEffect(() => {
    if (!room) return;

    const handleDataReceived = (payload: Uint8Array) => {
      try {
        const decoder = new TextDecoder();
        const data = JSON.parse(decoder.decode(payload));

        // 1. Specific Target Mute
        if (data.action === 'mute') {
          if (data.target === localParticipant.identity) {
            if (data.kind === 'audio') {
              localParticipant.setMicrophoneEnabled(false);
            }
            if (data.kind === 'video') {
              localParticipant.setCameraEnabled(false);
            }
          }
        }

        // 2. Global Mute
        if (data.action === 'mute_all' && localParticipant.isMicrophoneEnabled) {
          localParticipant.setMicrophoneEnabled(false);
        }

        // 3. Kick Command
        if (data.action === 'kick' && data.target === localParticipant.identity) {
          if (onKicked) onKicked();
          room.disconnect();
        }

        // 4. End Room for Everyone
        if (data.action === 'end_room') {
          if (onRoomEnded) onRoomEnded();
          room.disconnect();
        }

        // 5. Emoji Reaction
        if (data.type === 'reaction') {
          if (onReceiveReaction) {
            onReceiveReaction({
              id: Math.random().toString(36).substring(2, 9),
              emoji: data.emoji,
              sender: data.sender,
              xPos: Math.floor(Math.random() * 60) + 20, // 20% to 80%
              createdAt: Date.now(),
            });
          }
        }

        // 6. Chat Message
        if (data.type === 'chat') {
          if (onReceiveChatMessage) {
            soundManager.playChatPop();
            onReceiveChatMessage({
              id: data.id || Math.random().toString(36).substring(2, 9),
              sender: data.sender,
              text: data.text,
              timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isSelf: data.sender === localParticipant.identity,
            });
          }
        }

        // 7. Hand Raise
        if (data.type === 'hand_raise') {
          if (onReceiveHandRaise) {
            if (data.isRaised) {
              soundManager.playHandRaise();
            }
            onReceiveHandRaise(data.identity, data.isRaised);
          }
        }

        // 8. Whiteboard Drawing
        if (data.type === 'wb_draw') {
          if (onReceiveDrawEvent) {
            onReceiveDrawEvent(data);
          }
        }
      } catch (err) {
        console.error('Error parsing DataChannel event:', err);
      }
    };

    room.on('dataReceived', handleDataReceived);
    return () => {
      room.off('dataReceived', handleDataReceived);
    };
  }, [
    room,
    localParticipant,
    onKicked,
    onRoomEnded,
    onReceiveReaction,
    onReceiveChatMessage,
    onReceiveHandRaise,
    onReceiveDrawEvent,
  ]);

  return null;
};