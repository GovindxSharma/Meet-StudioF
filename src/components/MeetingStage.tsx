import React, { useState } from 'react';
import {
  useTracks,
  useLocalParticipant,
  VideoTrack,
  RoomAudioRenderer,
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
    <div className="relative w-full h-full p-2 sm:p-4 flex flex-col justify-center items-center overflow-hidden font-sans select-none bg-[#f8f9fa]">
      {/* Invisible Room Audio Renderer (Zero UI audio bar) */}
      <RoomAudioRenderer />

      {/* CASE A: SPOTLIGHT / PINNED / SCREEN SHARE MODE */}
      {activeSpotlightTrack ? (
        <div className="w-full h-full flex flex-col lg:flex-row gap-2 sm:gap-3 overflow-hidden">
          {/* Main Stage Video */}
          <div className="flex-1 h-full min-h-0 bg-[#202124] border border-[#dadce0] rounded-2xl sm:rounded-3xl overflow-hidden relative shadow-md flex items-center justify-center">
            {activeSpotlightTrack.publication?.isSubscribed || activeSpotlightTrack.participant.isLocal ? (
              <VideoTrack
                trackRef={activeSpotlightTrack as any}
                className="w-full h-full object-contain"
              />
            ) : (
              <AvatarPlaceholder participant={activeSpotlightTrack.participant} />
            )}

            {/* Spotlight Badges */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-[#202124]/80 backdrop-blur-md px-3 py-1 rounded-xl shadow-md text-white">
              <span className="text-xs font-semibold">
                {activeSpotlightTrack.participant.name || activeSpotlightTrack.participant.identity}
                {activeSpotlightTrack.source === Track.Source.ScreenShare ? ' (Presentation)' : ''}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setPinnedIdentity(null)}
              className="absolute top-3 right-3 bg-white/90 hover:bg-white text-[#202124] p-2 rounded-xl border border-[#dadce0] cursor-pointer transition-colors shadow-md"
              title="Unpin"
            >
              <PinOff className="w-4 h-4" />
            </button>
          </div>

          {/* Side / Bottom Filmstrip */}
          <div className="w-full lg:w-60 h-28 sm:h-36 lg:h-full flex lg:flex-col gap-2 sm:gap-3 overflow-x-auto lg:overflow-y-auto shrink-0 pb-1">
            {trackReferences
              .filter((t) => t !== activeSpotlightTrack)
              .map((trackRef) => (
                <div
                  key={`${trackRef.participant.identity}-${trackRef.source}`}
                  className="w-36 sm:w-44 lg:w-full h-full lg:h-36 shrink-0"
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
        /* CASE B: DYNAMIC RESPONSIVE GRID (Mobile & Desktop Optimized) */
        <div
          className={`w-full h-full grid gap-2 sm:gap-4 max-w-7xl mx-auto items-center justify-center ${
            trackReferences.length === 1
              ? 'grid-cols-1 max-w-3xl aspect-[4/3] sm:aspect-video'
              : trackReferences.length === 2
              ? 'grid-cols-1 sm:grid-cols-2 max-w-5xl'
              : trackReferences.length <= 4
              ? 'grid-cols-2 max-w-5xl'
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
            <div className="flex flex-col items-center justify-center p-6 bg-white border border-[#dadce0] rounded-3xl text-center space-y-3 shadow-md">
              <div className="w-14 h-14 rounded-full bg-[#1a73e8] flex items-center justify-center text-white text-xl font-bold shadow-md">
                {localParticipant.identity.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-[#202124]">Connecting your camera & mic...</p>
                <p className="text-xs text-[#5f6368] mt-0.5">Please wait a moment</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Individual Participant Video Tile (Clean, No Voice Bars Above Feed)
const Tile: React.FC<{
  trackRef: any;
  isPinned: boolean;
  onTogglePin: () => void;
  isHandRaised: boolean;
}> = ({ trackRef, isPinned, onTogglePin, isHandRaised }) => {
  const isMicOn = trackRef.participant.isMicrophoneEnabled;
  const isCamOn = trackRef.participant.isCameraEnabled;
  const isSelf = trackRef.participant.isLocal;
  const participantName = trackRef.participant.name || trackRef.participant.identity;

  return (
    <div
      className="relative w-full h-full min-h-[140px] sm:min-h-[200px] bg-[#202124] border border-[#dadce0] rounded-2xl sm:rounded-3xl overflow-hidden flex items-center justify-center group shadow-md"
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

      {/* Overlay: Bottom Left Name Pill */}
      <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 bg-[#202124]/80 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-md max-w-[85%]">
        <span className="text-[11px] sm:text-xs font-semibold text-white truncate">
          {participantName} {isSelf ? '(You)' : ''}
        </span>
        <div className={`p-0.5 rounded ${isMicOn ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isMicOn ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
        </div>
      </div>

      {/* Overlay: Hand Raised Badge */}
      {isHandRaised && (
        <div className="absolute top-2.5 left-2.5 bg-[#fef7e0] border border-[#fce8b2] text-[#b06000] font-bold text-[10px] sm:text-[11px] px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-md">
          <Hand className="w-3 h-3" />
          <span>Hand raised</span>
        </div>
      )}

      {/* Overlay: Pin Action Button on Hover */}
      <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={onTogglePin}
          className="p-1.5 sm:p-2 bg-white/90 hover:bg-white text-[#202124] rounded-xl shadow-md cursor-pointer transition-colors border border-[#dadce0]"
          title={isPinned ? 'Unpin' : 'Pin tile'}
        >
          {isPinned ? <PinOff className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <Pin className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
        </button>
      </div>
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
    <div className="flex flex-col items-center justify-center gap-2 p-4">
      <div
        className={`w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-gradient-to-tr ${colors[colorIndex]} flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-md`}
      >
        {initial}
      </div>
      <span className="text-xs text-slate-300 font-medium truncate max-w-[120px]">{name}</span>
    </div>
  );
};
