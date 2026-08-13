import React, { useEffect } from 'react';
import { useRoomContext, useLocalParticipant } from '@livekit/components-react';

export const HostDataListener: React.FC = () => {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();

  useEffect(() => {
    if (!room) return;

    const handleDataReceived = (payload: Uint8Array) => {
      try {
        const decoder = new TextDecoder();
        const data = JSON.parse(decoder.decode(payload));

        // 1. Mute Audio/Video Command
        if (data.action === 'mute') {
          if (data.target === localParticipant.identity || data.action === 'mute_all') {
            if (data.kind === 'audio' || data.action === 'mute_all') {
              localParticipant.setMicrophoneEnabled(false);
            }
            if (data.kind === 'video') {
              localParticipant.setCameraEnabled(false);
            }
          }
        }

        // 2. Global Mute Command
        if (data.action === 'mute_all' && localParticipant.isMicrophoneEnabled) {
          localParticipant.setMicrophoneEnabled(false);
        }

        // 3. Kick Command
        if (data.action === 'kick' && data.target === localParticipant.identity) {
          alert('The host has removed you from this meeting.');
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
  }, [room, localParticipant]);

  return null;
};