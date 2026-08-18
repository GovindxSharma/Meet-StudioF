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
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-96 bg-white border-l border-[#dadce0] shadow-2xl flex flex-col font-sans select-none animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#dadce0]">
        <div className="flex items-center gap-2.5">
          <Users className="w-5 h-5 text-[#1a73e8]" />
          <h3 className="text-base font-bold text-[#202124] tracking-tight">
            People ({participants.length})
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-[#5f6368] hover:text-[#202124] rounded-full hover:bg-[#f1f3f4] transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-4 border-b border-[#dadce0] bg-[#f8f9fa]">
        <div className="relative">
          <Search className="w-4 h-4 text-[#80868b] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search for people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-[#dadce0] focus:border-[#1a73e8] rounded-xl pl-9 pr-3.5 py-2 text-xs text-[#202124] placeholder-[#80868b] outline-none shadow-2xs"
          />
        </div>
      </div>

      {/* Host Controls: Mute All */}
      {isHost && (
        <div className="px-4 py-3 border-b border-[#dadce0] bg-white">
          <button
            type="button"
            onClick={handleMuteAll}
            className="w-full bg-[#fce8e6] hover:bg-[#fad2cf] text-[#c5221f] border border-[#fad2cf] py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer shadow-2xs"
          >
            <VolumeX className="w-4 h-4 text-[#c5221f]" />
            <span>Mute all participants</span>
          </button>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
        {/* Waiting Room Section (if pending guests) */}
        {pendingGuests.length > 0 && isHost && (
          <div className="space-y-2 pb-3 border-b border-[#dadce0]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#b06000] flex items-center gap-1.5">
              <span>Waiting to join</span>
              <span className="bg-[#fef7e0] text-[#b06000] border border-[#fce8b2] text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {pendingGuests.length}
              </span>
            </span>
            {pendingGuests.map((guest) => (
              <div
                key={guest.participantName}
                className="flex items-center justify-between bg-[#fef7e0] border border-[#fce8b2] p-2.5 rounded-xl gap-2 shadow-2xs"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#202124] truncate">{guest.participantName}</p>
                  <p className="text-[10px] text-[#5f6368]">Knocking</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onDenyGuest(guest.participantName)}
                    className="px-2.5 py-1 bg-white text-[#c5221f] border border-[#dadce0] hover:bg-[#fce8e6] rounded-lg text-[11px] font-semibold cursor-pointer"
                  >
                    Deny
                  </button>
                  <button
                    type="button"
                    onClick={() => onApproveGuest(guest.participantName)}
                    className="px-3 py-1 bg-[#1a73e8] text-white hover:bg-[#1b66ca] rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-xs"
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
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#5f6368]">
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
                className="flex items-center justify-between bg-[#f8f9fa] hover:bg-[#f1f3f4] border border-[#dadce0] p-2.5 rounded-2xl transition-colors gap-2 shadow-2xs"
              >
                {/* User Info */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-full bg-[#e8f0fe] border border-[#d2e3fc] flex items-center justify-center text-[#1967d2] text-xs font-bold shrink-0 shadow-xs">
                    {(p.name || p.identity).charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs sm:text-sm font-semibold text-[#202124] truncate">
                        {p.name || p.identity}
                      </p>
                      {isSelf && <span className="text-[10px] text-[#5f6368] font-normal shrink-0">(You)</span>}
                    </div>

                    {/* Status badges */}
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {isHandRaised && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-[#fef7e0] text-[#b06000] border border-[#fce8b2] px-1.5 py-0.2 rounded-md animate-pulse">
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
                      isMicOn ? 'text-[#188038] bg-[#e6f4ea]' : 'text-[#c5221f] bg-[#fce8e6]'
                    }`}
                  >
                    {isMicOn ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                  </div>

                  {/* Cam Status */}
                  <div
                    className={`p-1.5 rounded-lg text-xs ${
                      isCamOn ? 'text-[#188038] bg-[#e6f4ea]' : 'text-[#5f6368] bg-[#f1f3f4]'
                    }`}
                  >
                    {isCamOn ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
                  </div>

                  {/* Host moderation on remote guests */}
                  {isHost && !isSelf && (
                    <div className="flex items-center gap-1 ml-1 border-l border-[#dadce0] pl-1">
                      {isMicOn && (
                        <button
                          type="button"
                          onClick={() => handleMuteParticipant(p.identity, 'audio')}
                          title="Mute microphone"
                          className="p-1.5 bg-white hover:bg-[#fce8e6] text-[#5f6368] hover:text-[#c5221f] border border-[#dadce0] rounded-lg transition-colors cursor-pointer"
                        >
                          <MicOff className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleKickParticipant(p.identity)}
                        title="Remove participant"
                        className="p-1.5 bg-white hover:bg-[#fce8e6] text-[#5f6368] hover:text-[#c5221f] border border-[#dadce0] rounded-lg transition-colors cursor-pointer"
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
