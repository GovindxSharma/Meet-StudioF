import React, { useState } from 'react';
import {
  useTracks,
  useLocalParticipant,
  useIsSpeaking,
  VideoTrack,
  AudioConference,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { Mic, MicOff, Pin, PinOff, Hand } from 'lucide-react';

interface MeetingStageProps {
  handRaisedUsers: string[];
}

export const MeetingStage: React.FC<MeetingStageProps> = ({ handRaisedUsers }) => {
  const [pinnedIdentity, setPinnedIdentity] = useState<string | null>(null);

  // Grab both Camera and ScreenShare tracks
  const trackReferences = useTracks([
    { source: Track.Source.Camera, withPlaceholder: true },
    { source: Track.Source.ScreenShare, withPlaceholder: false },
  ]);

  const { localParticipant } = useLocalParticipant();

  // If a screen share is active, auto-prioritize it as spotlight
  const screenShareTrack = trackReferences.find((t) => t.source === Track.Source.ScreenShare);
  const activeSpotlightTrack = screenShareTrack || (pinnedIdentity ? trackReferences.find((t) => t.participant.identity === pinnedIdentity) : null);

  return (
    <div className="relative w-full h-full p-2 sm:p-4 flex flex-col justify-center items-center overflow-hidden font-sans select-none bg-[#131314]">
      {/* Audio Conference Component handles audio rendering silently in background */}
      <AudioConference />

      {/* CASE A: SPOTLIGHT / PINNED / SCREEN SHARE MODE */}
      {activeSpotlightTrack ? (
        <div className="w-full h-full flex flex-col lg:flex-row gap-3 overflow-hidden">
          {/* Main Stage Video */}
          <div className="flex-1 h-full min-h-0 bg-[#202124] border border-[#3c4043] rounded-3xl overflow-hidden relative shadow-2xl flex items-center justify-center">
            {activeSpotlightTrack.publication?.isSubscribed || activeSpotlightTrack.participant.isLocal ? (
              <VideoTrack
                trackRef={activeSpotlightTrack as any}
                className="w-full h-full object-contain"
              />
            ) : (
              <AvatarPlaceholder participant={activeSpotlightTrack.participant} />
            )}

            {/* Spotlight Badges */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-[#202124]/90 backdrop-blur-md border border-[#3c4043] px-3 py-1.5 rounded-xl shadow-lg">
              <span className="text-xs font-semibold text-white">
                {activeSpotlightTrack.participant.name || activeSpotlightTrack.participant.identity}
                {activeSpotlightTrack.source === Track.Source.ScreenShare ? ' (Presentation)' : ''}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setPinnedIdentity(null)}
              className="absolute top-4 right-4 bg-[#202124]/90 hover:bg-[#3c4043] text-white p-2 rounded-xl border border-[#3c4043] cursor-pointer transition-colors shadow-lg"
              title="Unpin"
            >
              <PinOff className="w-4 h-4" />
            </button>
          </div>

          {/* Side / Bottom Filmstrip of other participants */}
          <div className="w-full lg:w-64 h-32 lg:h-full flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto shrink-0 pb-1">
            {trackReferences
              .filter((t) => t !== activeSpotlightTrack)
              .map((trackRef) => (
                <div
                  key={`${trackRef.participant.identity}-${trackRef.source}`}
                  className="w-44 lg:w-full h-full lg:h-40 shrink-0"
                >
                  <Tile
                    trackRef={trackRef}
                    isPinned={false}
                    onTogglePin={() => setPinnedIdentity(trackRef.participant.identity)}
                    isHandRaised={handRaisedUsers.includes(trackRef.participant.identity)}
                  />
                </div>
              ))}
          </div>
        </div>
      ) : (
        /* CASE B: DYNAMIC RESPONSIVE GRID */
        <div
          className={`w-full h-full grid gap-3 sm:gap-4 max-w-7xl mx-auto items-center justify-center ${
            trackReferences.length === 1
              ? 'grid-cols-1 max-w-4xl'
              : trackReferences.length === 2
              ? 'grid-cols-1 sm:grid-cols-2'
              : trackReferences.length <= 4
              ? 'grid-cols-1 sm:grid-cols-2'
              : trackReferences.length <= 6
              ? 'grid-cols-2 sm:grid-cols-3'
              : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
          }`}
        >
          {trackReferences.map((trackRef) => (
            <Tile
              key={`${trackRef.participant.identity}-${trackRef.source}`}
              trackRef={trackRef}
              isPinned={pinnedIdentity === trackRef.participant.identity}
              onTogglePin={() =>
                setPinnedIdentity(
                  pinnedIdentity === trackRef.participant.identity
                    ? null
                    : trackRef.participant.identity
                )
              }
              isHandRaised={handRaisedUsers.includes(trackRef.participant.identity)}
            />
          ))}

          {/* Fallback if no tracks ready yet */}
          {trackReferences.length === 0 && (
            <div className="flex flex-col items-center justify-center p-8 bg-[#202124] border border-[#3c4043] rounded-3xl text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#1a73e8] flex items-center justify-center text-white text-2xl font-bold">
                {localParticipant.identity.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-base font-bold text-white">Connecting your camera & mic...</p>
                <p className="text-xs text-slate-400 mt-0.5">Please wait a moment</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Individual Participant Video Tile
const Tile: React.FC<{
  trackRef: any;
  isPinned: boolean;
  onTogglePin: () => void;
  isHandRaised: boolean;
}> = ({ trackRef, isPinned, onTogglePin, isHandRaised }) => {
  const isSpeaking = useIsSpeaking(trackRef.participant);
  const isMicOn = trackRef.participant.isMicrophoneEnabled;
  const isCamOn = trackRef.participant.isCameraEnabled;
  const isSelf = trackRef.participant.isLocal;
  const participantName = trackRef.participant.name || trackRef.participant.identity;

  return (
    <div
      className={`relative w-full h-full min-h-[160px] sm:min-h-[220px] bg-[#202124] border rounded-2xl sm:rounded-3xl overflow-hidden flex items-center justify-center group shadow-xl transition-all ${
        isSpeaking
          ? 'border-[#8ab4f8] ring-2 ring-[#8ab4f8]/50 shadow-[#8ab4f8]/10'
          : 'border-[#3c4043]'
      }`}
    >
      {/* Video Track Stream or Avatar Fallback */}
      {isCamOn && trackRef.publication?.track ? (
        <VideoTrack
          trackRef={trackRef as any}
          className={`w-full h-full object-cover ${isSelf ? 'transform -scale-x-100' : ''}`}
        />
      ) : (
        <AvatarPlaceholder participant={trackRef.participant} />
      )}

      {/* Overlay: Bottom Name Pill with Mic Status */}
      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-[#202124]/85 backdrop-blur-md border border-[#3c4043]/80 px-2.5 py-1 rounded-xl shadow-md max-w-[85%]">
        <span className="text-xs font-semibold text-white truncate">
          {participantName} {isSelf ? '(You)' : ''}
        </span>
        <div className={`p-0.5 rounded ${isMicOn ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isMicOn ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
        </div>
      </div>

      {/* Overlay: Hand Raised Badge */}
      {isHandRaised && (
        <div className="absolute top-3 left-3 bg-amber-400/90 text-[#202124] font-bold text-[11px] px-2.5 py-1 rounded-xl flex items-center gap-1.5 shadow-lg animate-bounce">
          <Hand className="w-3.5 h-3.5" />
          <span>Hand raised</span>
        </div>
      )}

      {/* Overlay: Pin Action Button on Hover */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={onTogglePin}
          className="p-2 bg-[#202124]/90 hover:bg-[#3c4043] border border-[#3c4043] text-white rounded-xl shadow-md cursor-pointer transition-colors"
          title={isPinned ? 'Unpin' : 'Pin tile'}
        >
          {isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Speaking Active Glow Ripples */}
      {isSpeaking && (
        <div className="absolute inset-0 pointer-events-none border-2 border-[#8ab4f8] rounded-2xl sm:rounded-3xl animate-pulse" />
      )}
    </div>
  );
};

// Avatar placeholder when camera is off
const AvatarPlaceholder: React.FC<{ participant: any }> = ({ participant }) => {
  const name = participant.name || participant.identity || 'User';
  const initial = name.charAt(0).toUpperCase();

  const colors = [
    'from-indigo-600 to-blue-500',
    'from-emerald-600 to-teal-500',
    'from-violet-600 to-purple-500',
    'from-amber-600 to-orange-500',
    'from-rose-600 to-pink-500',
  ];
  const colorIndex = name.charCodeAt(0) % colors.length;

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div
        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr ${colors[colorIndex]} flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-lg`}
      >
        {initial}
      </div>
      <span className="text-xs text-slate-400 font-medium">{name}</span>
    </div>
  );
};
