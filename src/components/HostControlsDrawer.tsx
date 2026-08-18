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
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-96 bg-[#202124] border-l border-[#3c4043] shadow-2xl flex flex-col font-sans select-none animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#3c4043]">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-white tracking-tight">Host controls</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-[#303134] transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 space-y-6 flex-1 overflow-y-auto">
        {/* Master Host Management Switch */}
        <div className="bg-[#171717] border border-[#3c4043] p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-white">Host management</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Restricts what participants can do in this meeting
              </p>
            </div>
            <button
              type="button"
              onClick={() => setHostManagementEnabled(!hostManagementEnabled)}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                hostManagementEnabled ? 'bg-[#1a73e8]' : 'bg-[#3c4043]'
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
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Let participants:
          </h4>

          <div className="space-y-2">
            {/* Share Screen */}
            <div className="flex items-center justify-between p-3 bg-[#171717] border border-[#3c4043] rounded-2xl">
              <span className="text-xs font-medium text-slate-200">Share their screen</span>
              <button
                type="button"
                onClick={() => setScreenShareAllowed(!screenShareAllowed)}
                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                  screenShareAllowed ? 'bg-[#1a73e8]' : 'bg-[#3c4043]'
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
            <div className="flex items-center justify-between p-3 bg-[#171717] border border-[#3c4043] rounded-2xl">
              <span className="text-xs font-medium text-slate-200">Send chat messages</span>
              <button
                type="button"
                onClick={() => onToggleChatEnabled(!chatEnabled)}
                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                  chatEnabled ? 'bg-[#1a73e8]' : 'bg-[#3c4043]'
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
            <div className="flex items-center justify-between p-3 bg-[#171717] border border-[#3c4043] rounded-2xl">
              <span className="text-xs font-medium text-slate-200">Turn on their microphone</span>
              <button
                type="button"
                onClick={() => setMicAllowed(!micAllowed)}
                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                  micAllowed ? 'bg-[#1a73e8]' : 'bg-[#3c4043]'
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
            <div className="flex items-center justify-between p-3 bg-[#171717] border border-[#3c4043] rounded-2xl">
              <span className="text-xs font-medium text-slate-200">Turn on their video</span>
              <button
                type="button"
                onClick={() => setCameraAllowed(!cameraAllowed)}
                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                  cameraAllowed ? 'bg-[#1a73e8]' : 'bg-[#3c4043]'
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
            className="w-full bg-[#303134] hover:bg-[#3c4043] text-rose-300 font-bold py-3 px-4 rounded-2xl text-xs flex items-center justify-center gap-2 border border-rose-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <VolumeX className="w-4 h-4 text-rose-400" />
            <span>Mute All Microphones</span>
          </button>
        </div>

        {/* Remote Guests List */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Active Guests ({remoteGuests.length})
          </h4>

          {remoteGuests.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4 bg-[#171717] rounded-2xl">
              No remote guests in call
            </p>
          ) : (
            remoteGuests.map((p) => {
              const isMicOn = p.isMicrophoneEnabled;
              const isCamOn = p.isCameraEnabled;

              return (
                <div
                  key={p.identity}
                  className="flex items-center justify-between bg-[#171717] border border-[#3c4043] p-3 rounded-2xl gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-white truncate">
                      {p.name || p.identity}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
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
                      className="p-2 bg-[#303134] hover:bg-[#3c4043] disabled:opacity-30 text-amber-400 rounded-xl cursor-pointer"
                    >
                      <MicOff className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleKickParticipant(p.identity)}
                      title="Remove user"
                      className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl cursor-pointer"
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