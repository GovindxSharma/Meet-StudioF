import React, { useEffect } from 'react';
import { useRoomContext, useLocalParticipant } from '@livekit/components-react';

interface HostDataListenerProps {
  onKicked?: () => void;
}

export const HostDataListener: React.FC<HostDataListenerProps> = ({ onKicked }) => {
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
      } catch (err) {
        console.error('Error parsing host data command:', err);
      }
    };

    room.on('dataReceived', handleDataReceived);
    return () => {
      room.off('dataReceived', handleDataReceived);
    };
  }, [room, localParticipant, onKicked]);

  return null;
};