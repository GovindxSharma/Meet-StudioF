import React, { useState } from 'react';
import { X, Search, VolumeX, Mic, MicOff, Video, VideoOff, UserX, Hand, Users, UserCheck } from 'lucide-react';
import { useParticipants, useLocalParticipant, useRoomContext } from '@livekit/components-react';

interface PendingGuest {
  participantName: string;
  requestedAt: string;
}

interface PeopleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isHost: boolean;
  pendingGuests: PendingGuest[];
  onApproveGuest: (name: string) => void;
  onDenyGuest: (name: string) => void;
  handRaisedUsers: string[];
}

export const PeopleDrawer: React.FC<PeopleDrawerProps> = ({
  isOpen,
  onClose,
  isHost,
  pendingGuests,
  onApproveGuest,
  onDenyGuest,
  handRaisedUsers,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const room = useRoomContext();
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();

  if (!isOpen) return null;

  const handleMuteAll = async () => {
    try {
      if (!room) return;
      const encoder = new TextEncoder();
      const payload = encoder.encode(JSON.stringify({ action: 'mute_all' }));
      await room.localParticipant.publishData(payload, { reliable: true });
    } catch (err) {
      console.error('Failed to mute all:', err);
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

  const filteredParticipants = participants.filter((p) =>
    (p.name || p.identity).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-96 bg-[#202124] border-l border-[#3c4043] shadow-2xl flex flex-col font-sans select-none animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#3c4043]">
        <div className="flex items-center gap-2.5">
          <Users className="w-5 h-5 text-[#8ab4f8]" />
          <h3 className="text-base font-bold text-white tracking-tight">
            People ({participants.length})
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-[#303134] transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-4 border-b border-[#3c4043]/60 bg-[#171717]">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search for people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#202124] border border-[#3c4043] focus:border-[#8ab4f8] rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none"
          />
        </div>
      </div>

      {/* Host Controls: Mute All */}
      {isHost && (
        <div className="px-4 py-3 border-b border-[#3c4043]/60 bg-[#202124]">
          <button
            type="button"
            onClick={handleMuteAll}
            className="w-full bg-[#303134] hover:bg-[#3c4043] text-rose-300 border border-rose-500/20 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
          >
            <VolumeX className="w-4 h-4 text-rose-400" />
            <span>Mute all participants</span>
          </button>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Waiting Room Section (if pending guests) */}
        {pendingGuests.length > 0 && isHost && (
          <div className="space-y-2 pb-3 border-b border-[#3c4043]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <span>Waiting to join</span>
              <span className="bg-amber-400/20 text-amber-300 text-[10px] px-1.5 py-0.2 rounded-full">
                {pendingGuests.length}
              </span>
            </span>
            {pendingGuests.map((guest) => (
              <div
                key={guest.participantName}
                className="flex items-center justify-between bg-[#2d2e30] border border-amber-500/30 p-2.5 rounded-xl gap-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white truncate">{guest.participantName}</p>
                  <p className="text-[10px] text-slate-400">Knocking</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onDenyGuest(guest.participantName)}
                    className="px-2 py-1 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-lg text-[11px] font-semibold cursor-pointer"
                  >
                    Deny
                  </button>
                  <button
                    type="button"
                    onClick={() => onApproveGuest(guest.participantName)}
                    className="px-2.5 py-1 bg-[#1a73e8] text-white hover:bg-[#1b66ca] rounded-lg text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <UserCheck className="w-3 h-3" /> Admit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* In Call Participant List */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            In meeting
          </span>

          {filteredParticipants.map((p) => {
            const isSelf = p.identity === localParticipant.identity;
            const isMicOn = p.isMicrophoneEnabled;
            const isCamOn = p.isCameraEnabled;
            const isHandRaised = handRaisedUsers.includes(p.identity);

            return (
              <div
                key={p.identity}
                className="flex items-center justify-between bg-[#171717] hover:bg-[#2d2e30] border border-[#3c4043]/60 p-2.5 rounded-2xl transition-colors gap-2"
              >
                {/* User Info */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1a73e8] to-[#8ab4f8] flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {(p.name || p.identity).charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs sm:text-sm font-semibold text-white truncate">
                        {p.name || p.identity}
                      </p>
                      {isSelf && <span className="text-[10px] text-slate-400 shrink-0">(You)</span>}
                    </div>

                    {/* Status badges */}
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {isHandRaised && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded-md animate-pulse">
                          <Hand className="w-2.5 h-2.5" /> Hand raised
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Icons & Host Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* Mic Status */}
                  <div
                    className={`p-1.5 rounded-lg text-xs ${
                      isMicOn ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                    }`}
                  >
                    {isMicOn ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                  </div>

                  {/* Cam Status */}
                  <div
                    className={`p-1.5 rounded-lg text-xs ${
                      isCamOn ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500 bg-slate-800'
                    }`}
                  >
                    {isCamOn ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
                  </div>

                  {/* Host moderation on remote guests */}
                  {isHost && !isSelf && (
                    <div className="flex items-center gap-1 ml-1 border-l border-[#3c4043] pl-1">
                      {isMicOn && (
                        <button
                          type="button"
                          onClick={() => handleMuteParticipant(p.identity, 'audio')}
                          title="Mute microphone"
                          className="p-1.5 bg-[#303134] hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                        >
                          <MicOff className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleKickParticipant(p.identity)}
                        title="Remove participant"
                        className="p-1.5 bg-[#303134] hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                      >
                        <UserX className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
