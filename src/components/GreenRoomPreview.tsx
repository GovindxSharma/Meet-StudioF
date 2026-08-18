import React, { useEffect, useRef, useState } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Crown,
  Clock,
  User,
  ShieldCheck,
  Settings,
  Copy,
  Check,
  FlipHorizontal,
} from 'lucide-react';
import { SettingsModal } from './SettingsModal';

interface GreenRoomPreviewProps {
  roomName: string;
  participantName: string;
  setParticipantName: (name: string) => void;
  isHost: boolean;
  onJoin: () => void;
  loading: boolean;
  status: 'idle' | 'pending' | 'denied';
}

export const GreenRoomPreview: React.FC<GreenRoomPreviewProps> = ({
  roomName,
  participantName,
  setParticipantName,
  isHost,
  onJoin,
  loading,
  status,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [isMirrored, setIsMirrored] = useState(true);
  const [visualEffect, setVisualEffect] = useState<'normal' | 'warm' | 'studio' | 'mono'>('normal');
  const [showSettings, setShowSettings] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Auto-fill participant name from localStorage if empty
  useEffect(() => {
    if (!participantName.trim()) {
      const savedName = localStorage.getItem('user_display_name');
      if (savedName) {
        setParticipantName(savedName);
      }
    }
  }, [participantName, setParticipantName]);

  // Initialize camera and microphone preview stream
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((mediaStream) => {
        activeStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      })
      .catch((err) => console.error('Error accessing video/audio devices:', err));

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const toggleCamera = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !cameraOn;
        setCameraOn(!cameraOn);
      }
    }
  };

  const toggleMic = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !micOn;
        setMicOn(!micOn);
      }
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Filter styles
  const filterStyles = {
    normal: '',
    warm: 'sepia(20%) saturate(115%) brightness(105%)',
    studio: 'contrast(110%) brightness(105%) saturate(110%)',
    mono: 'grayscale(100%) contrast(115%)',
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#ffffff] text-[#202124] flex items-center justify-center p-3 sm:p-6 lg:p-8 font-sans select-none relative overflow-x-hidden">
      {/* Subtle Background Accent */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-[#f8f9fa] to-transparent pointer-events-none" />

      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-10 items-center z-10 my-auto">
        {/* LEFT COLUMN: Clean Video Preview Box (Completely free of audio meters) */}
        <div className="lg:col-span-7 flex flex-col items-center w-full space-y-3">
          <div className="relative w-full aspect-video bg-[#202124] border border-[#dadce0] rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl flex items-center justify-center">
            {/* Live Media Feed or Camera Off */}
            {cameraOn ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                style={{ filter: filterStyles[visualEffect] }}
                className={`w-full h-full object-cover transition-all ${
                  isMirrored ? 'transform -scale-x-100' : ''
                }`}
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-slate-400 p-6 text-center">
                <div className="w-14 h-14 rounded-full bg-[#303134] flex items-center justify-center text-slate-300">
                  <VideoOff className="w-7 h-7" />
                </div>
                <span className="text-xs font-semibold text-slate-300">Camera is turned off</span>
              </div>
            )}

            {/* Top Right: Mirror & Settings Icon Pills */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsMirrored(!isMirrored)}
                title="Mirror video"
                className="p-2 bg-[#202124]/80 hover:bg-[#303134] text-white rounded-full border border-white/20 transition-colors cursor-pointer"
              >
                <FlipHorizontal className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowSettings(true)}
                title="Audio and video settings"
                className="p-2 bg-[#202124]/80 hover:bg-[#303134] text-white rounded-full border border-white/20 transition-colors cursor-pointer"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Floating Pill Controls */}
            <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-[#202124]/85 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-2xl">
              <button
                type="button"
                onClick={toggleMic}
                title={micOn ? 'Turn off microphone' : 'Turn on microphone'}
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-md ${
                  micOn
                    ? 'bg-[#3c4043] hover:bg-[#474a4e] text-white'
                    : 'bg-[#ea4335] hover:bg-[#d93025] text-white'
                }`}
              >
                {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={toggleCamera}
                title={cameraOn ? 'Turn off camera' : 'Turn on camera'}
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-md ${
                  cameraOn
                    ? 'bg-[#3c4043] hover:bg-[#474a4e] text-white'
                    : 'bg-[#ea4335] hover:bg-[#d93025] text-white'
                }`}
              >
                {cameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Filter presets bar */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-[#5f6368] pt-1">
            <span className="text-[11px] sm:text-xs font-semibold">Lighting:</span>
            {(['normal', 'warm', 'studio', 'mono'] as const).map((eff) => (
              <button
                key={eff}
                type="button"
                onClick={() => setVisualEffect(eff)}
                className={`px-2.5 sm:px-3 py-1 rounded-full capitalize text-[11px] sm:text-xs transition-colors cursor-pointer ${
                  visualEffect === eff
                    ? 'bg-[#1a73e8] text-white font-semibold shadow-xs'
                    : 'bg-[#f1f3f4] text-[#3c4043] hover:bg-[#e8eaed]'
                }`}
              >
                {eff}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Join Card (Pure Light Theme) */}
        <div className="lg:col-span-5 w-full bg-white border border-[#dadce0] rounded-2xl sm:rounded-3xl p-5 sm:p-8 space-y-5 sm:space-y-6 shadow-xl text-left">
          {/* Header Info */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1a73e8]">
                Room #{roomName}
              </span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="text-xs font-medium text-[#5f6368] hover:text-[#1a73e8] flex items-center gap-1 cursor-pointer"
              >
                {copiedLink ? <Check className="w-3 h-3 text-[#188038]" /> : <Copy className="w-3 h-3" />}
                <span>{copiedLink ? 'Copied' : 'Copy link'}</span>
              </button>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#202124] tracking-tight">
              Ready to join?
            </h2>
            <p className="text-xs sm:text-sm text-[#5f6368] mt-1">
              Check your camera and microphone before entering Meet Studio.
            </p>
          </div>

          {/* Name Field Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#5f6368] uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#1a73e8]" /> Your Display Name
            </label>
            <input
              type="text"
              placeholder="e.g. Sarah Jenkins"
              value={participantName}
              onChange={(e) => {
                setParticipantName(e.target.value);
                localStorage.setItem('user_display_name', e.target.value);
              }}
              className="w-full bg-[#f8f9fa] border border-[#dadce0] focus:border-[#1a73e8] focus:bg-white focus:ring-2 focus:ring-[#1a73e8]/20 rounded-2xl px-4 py-3.5 text-sm text-[#202124] placeholder-[#80868b] outline-none transition-all shadow-xs"
            />
          </div>

          {/* Status Notifications */}
          {status === 'pending' && (
            <div className="p-3.5 bg-[#fef7e0] border border-[#fce8b2] rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-[#b06000] animate-pulse">
              <Clock className="w-4 h-4 text-[#f29900]" /> Asking host to let you in...
            </div>
          )}

          {status === 'denied' && (
            <div className="p-3.5 bg-[#fce8e6] border border-[#fad2cf] rounded-2xl text-center text-xs font-bold text-[#c5221f]">
              ❌ The host denied your request to join this meeting.
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 space-y-3">
            <button
              type="button"
              onClick={onJoin}
              disabled={loading || status === 'pending' || !participantName.trim()}
              className="w-full bg-[#1a73e8] hover:bg-[#1b66ca] text-white font-bold py-3.5 sm:py-4 px-4 rounded-2xl shadow-md shadow-[#1a73e8]/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm cursor-pointer min-h-[48px]"
            >
              {isHost ? <Crown className="w-4 h-4 text-amber-300" /> : null}
              {loading
                ? 'Connecting...'
                : status === 'pending'
                ? 'Waiting for approval...'
                : isHost
                ? 'Join now (Host)'
                : 'Ask to join'}
            </button>
          </div>

          {/* Footer Encryption Tag */}
          <div className="pt-3 border-t border-[#f1f3f4] flex items-center justify-center gap-2 text-xs text-[#5f6368]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#188038]" /> End-to-end encrypted WebRTC stream
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
};