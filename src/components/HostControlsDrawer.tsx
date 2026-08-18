import React, { useState } from 'react';
import { X, VolumeX, MicOff, UserX, ShieldAlert } from 'lucide-react';
import { useParticipants, useLocalParticipant, useRoomContext } from '@livekit/components-react';

interface HostControlsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  chatEnabled: boolean;
  onToggleChatEnabled: (enabled: boolean) => void;
}

export const HostControlsDrawer: React.FC<HostControlsDrawerProps> = ({
  isOpen,
  onClose,
  chatEnabled,
  onToggleChatEnabled,
}) => {
  const room = useRoomContext();
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();

  const [hostManagementEnabled, setHostManagementEnabled] = useState(true);
  const [screenShareAllowed, setScreenShareAllowed] = useState(true);
  const [micAllowed, setMicAllowed] = useState(true);
  const [cameraAllowed, setCameraAllowed] = useState(true);

  if (!isOpen) return null;

  const handleMuteAll = async () => {
    try {
      if (!room) return;
      const encoder = new TextEncoder();
      const payload = encoder.encode(JSON.stringify({ action: 'mute_all' }));
      await room.localParticipant.publishData(payload, { reliable: true });
    } catch (err) {
      console.error('Failed to mute all participants:', err);
    }
  };

  const handleMuteParticipant = async (identity: string, kind: 'audio' | 'video') => {
    try {
      if (!room) return;
      const encoder = new TextEncoder();
      const payload = encoder.encode(JSON.stringify({ action: 'mute', kind, target: identity }));
      await room.localParticipant.publishData(payload, { reliable: true });
    } catch (err) {
      console.error('Failed to mute participant:', err);
    }
  };

  const handleKickParticipant = async (identity: string) => {
    try {
      if (!room) return;
      const encoder = new TextEncoder();
      const payload = encoder.encode(JSON.stringify({ action: 'kick', target: identity }));
      await room.localParticipant.publishData(payload, { reliable: true });
    } catch (err) {
      console.error('Failed to kick participant:', err);
    }
  };

  const remoteGuests = participants.filter((p) => p.identity !== localParticipant.identity);

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-96 bg-white border-l border-[#dadce0] shadow-2xl flex flex-col font-sans select-none animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#dadce0]">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-5 h-5 text-[#f29900]" />
          <h3 className="text-base font-bold text-[#202124] tracking-tight">Host controls</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-[#5f6368] hover:text-[#202124] rounded-full hover:bg-[#f1f3f4] transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 space-y-6 flex-1 overflow-y-auto bg-white">
        {/* Master Host Management Switch */}
        <div className="bg-[#f8f9fa] border border-[#dadce0] p-4 rounded-2xl space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-[#202124]">Host management</h4>
              <p className="text-xs text-[#5f6368] mt-0.5">
                Restricts what participants can do in this meeting
              </p>
            </div>
            <button
              type="button"
              onClick={() => setHostManagementEnabled(!hostManagementEnabled)}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                hostManagementEnabled ? 'bg-[#1a73e8]' : 'bg-[#dadce0]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform transform absolute top-0.5 ${
                  hostManagementEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Participant Permissions */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#5f6368]">
            Let participants:
          </h4>

          <div className="space-y-2">
            {/* Share Screen */}
            <div className="flex items-center justify-between p-3 bg-[#f8f9fa] border border-[#dadce0] rounded-2xl shadow-2xs">
              <span className="text-xs font-semibold text-[#3c4043]">Share their screen</span>
              <button
                type="button"
                onClick={() => setScreenShareAllowed(!screenShareAllowed)}
                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                  screenShareAllowed ? 'bg-[#1a73e8]' : 'bg-[#dadce0]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform transform absolute top-0.5 ${
                    screenShareAllowed ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Send Chat Messages */}
            <div className="flex items-center justify-between p-3 bg-[#f8f9fa] border border-[#dadce0] rounded-2xl shadow-2xs">
              <span className="text-xs font-semibold text-[#3c4043]">Send chat messages</span>
              <button
                type="button"
                onClick={() => onToggleChatEnabled(!chatEnabled)}
                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                  chatEnabled ? 'bg-[#1a73e8]' : 'bg-[#dadce0]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform transform absolute top-0.5 ${
                    chatEnabled ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Turn on Microphones */}
            <div className="flex items-center justify-between p-3 bg-[#f8f9fa] border border-[#dadce0] rounded-2xl shadow-2xs">
              <span className="text-xs font-semibold text-[#3c4043]">Turn on their microphone</span>
              <button
                type="button"
                onClick={() => setMicAllowed(!micAllowed)}
                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                  micAllowed ? 'bg-[#1a73e8]' : 'bg-[#dadce0]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform transform absolute top-0.5 ${
                    micAllowed ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Turn on Video */}
            <div className="flex items-center justify-between p-3 bg-[#f8f9fa] border border-[#dadce0] rounded-2xl shadow-2xs">
              <span className="text-xs font-semibold text-[#3c4043]">Turn on their video</span>
              <button
                type="button"
                onClick={() => setCameraAllowed(!cameraAllowed)}
                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                  cameraAllowed ? 'bg-[#1a73e8]' : 'bg-[#dadce0]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform transform absolute top-0.5 ${
                    cameraAllowed ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Global Action: Mute All */}
        <div>
          <button
            type="button"
            onClick={handleMuteAll}
            className="w-full bg-[#fce8e6] hover:bg-[#fad2cf] text-[#c5221f] font-bold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 border border-[#fad2cf] active:scale-95 transition-all cursor-pointer shadow-xs"
          >
            <VolumeX className="w-4 h-4 text-[#c5221f]" />
            <span>Mute All Microphones</span>
          </button>
        </div>

        {/* Remote Guests List */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#5f6368]">
            Active Guests ({remoteGuests.length})
          </h4>

          {remoteGuests.length === 0 ? (
            <p className="text-xs text-[#5f6368] text-center py-4 bg-[#f8f9fa] rounded-2xl border border-[#dadce0]">
              No remote guests in meeting
            </p>
          ) : (
            remoteGuests.map((p) => {
              const isMicOn = p.isMicrophoneEnabled;
              const isCamOn = p.isCameraEnabled;

              return (
                <div
                  key={p.identity}
                  className="flex items-center justify-between bg-[#f8f9fa] border border-[#dadce0] p-3 rounded-2xl gap-2 shadow-2xs"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-[#202124] truncate">
                      {p.name || p.identity}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#5f6368]">
                      <span>{isMicOn ? '🎤 Mic Active' : '🔇 Muted'}</span>
                      <span>•</span>
                      <span>{isCamOn ? '📹 Cam On' : '📷 Cam Off'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleMuteParticipant(p.identity, 'audio')}
                      disabled={!isMicOn}
                      title="Mute audio"
                      className="p-2 bg-white hover:bg-[#fce8e6] disabled:opacity-40 text-[#5f6368] hover:text-[#c5221f] border border-[#dadce0] rounded-xl cursor-pointer shadow-2xs"
                    >
                      <MicOff className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleKickParticipant(p.identity)}
                      title="Remove user"
                      className="p-2 bg-[#fce8e6] hover:bg-[#fad2cf] text-[#c5221f] border border-[#fad2cf] rounded-xl cursor-pointer shadow-2xs"
                    >
                      <UserX className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};