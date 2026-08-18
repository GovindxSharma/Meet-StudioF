import React, { useEffect, useRef, useState } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Crown,
  Clock,
  Sparkles,
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
  const [micLevel, setMicLevel] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Initialize camera and microphone preview stream & live audio meter
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

        // Setup audio level meter
        try {
          const AudioCtx =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          const audioCtx = new AudioCtx();
          audioCtxRef.current = audioCtx;

          const source = audioCtx.createMediaStreamSource(mediaStream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);

          const checkVolume = () => {
            if (!activeStream || activeStream.getAudioTracks().length === 0) return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            setMicLevel(Math.min(100, Math.round((avg / 128) * 100)));
            animFrameRef.current = requestAnimationFrame(checkVolume);
          };

          checkVolume();
        } catch (e) {
          console.warn('Could not start audio meter:', e);
        }
      })
      .catch((err) => console.error('Error accessing video/audio devices:', err));

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
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
    warm: 'sepia(25%) saturate(120%) brightness(105%)',
    studio: 'contrast(115%) brightness(108%) saturate(110%)',
    mono: 'grayscale(100%) contrast(120%)',
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#131314] text-white flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans select-none relative overflow-x-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#1a73e8]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-center z-10">
        {/* LEFT COLUMN: Hardware Preview Box */}
        <div className="lg:col-span-7 flex flex-col items-center w-full space-y-3">
          <div className="relative w-full aspect-video bg-[#202124] border border-[#3c4043] rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center">
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
              <div className="flex flex-col items-center gap-3 text-slate-500 p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-[#303134] flex items-center justify-center text-slate-400">
                  <VideoOff className="w-8 h-8" />
                </div>
                <span className="text-xs font-semibold text-slate-400">Your camera is turned off</span>
              </div>
            )}

            {/* Top Left: Live Mic Audio Ripple Meter */}
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-[#202124]/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#3c4043] shadow-md">
              <div className={`w-2 h-2 rounded-full ${micOn ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              <span className="text-[11px] font-semibold text-slate-200">
                {micOn ? 'Mic on' : 'Mic muted'}
              </span>
              {micOn && (
                <div className="flex items-center gap-0.5 ml-1 h-3">
                  <div
                    className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(3, (micLevel / 100) * 12)}px` }}
                  />
                  <div
                    className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(3, (micLevel / 100) * 16)}px` }}
                  />
                  <div
                    className="w-1 bg-emerald-400 rounded-full transition-all duration-75"
                    style={{ height: `${Math.max(3, (micLevel / 100) * 10)}px` }}
                  />
                </div>
              )}
            </div>

            {/* Top Right: Mirror & Effects Buttons */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsMirrored(!isMirrored)}
                title="Mirror video"
                className="p-2 bg-[#202124]/90 hover:bg-[#303134] text-slate-300 rounded-full border border-[#3c4043] transition-colors cursor-pointer"
              >
                <FlipHorizontal className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setShowSettings(true)}
                title="Audio and video settings"
                className="p-2 bg-[#202124]/90 hover:bg-[#303134] text-slate-300 rounded-full border border-[#3c4043] transition-colors cursor-pointer"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Floating Pill Controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-[#202124]/90 backdrop-blur-xl px-4 py-2.5 rounded-full border border-[#3c4043] shadow-2xl">
              <button
                type="button"
                onClick={toggleMic}
                title={micOn ? 'Turn off microphone' : 'Turn on microphone'}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-md ${
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
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-md ${
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
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="text-[11px] font-medium">Lighting:</span>
            {(['normal', 'warm', 'studio', 'mono'] as const).map((eff) => (
              <button
                key={eff}
                type="button"
                onClick={() => setVisualEffect(eff)}
                className={`px-2.5 py-1 rounded-lg capitalize text-[11px] transition-colors cursor-pointer ${
                  visualEffect === eff
                    ? 'bg-[#8ab4f8] text-[#202124] font-bold'
                    : 'bg-[#202124] text-slate-300 hover:bg-[#303134]'
                }`}
              >
                {eff}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Join Decisions & Name Entry Card */}
        <div className="lg:col-span-5 w-full bg-[#202124] border border-[#3c4043] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-left">
          {/* Header Info */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#8ab4f8] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Room #{roomName}
              </span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedLink ? 'Copied' : 'Copy link'}</span>
              </button>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Ready to join?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              No one else is in the call yet. Check your audio and video before entering.
            </p>
          </div>

          {/* Name Field Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#8ab4f8]" /> Your Display Name
            </label>
            <input
              type="text"
              placeholder="e.g. Sarah Jenkins"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              className="w-full bg-[#131314] border border-[#3c4043] focus:border-[#8ab4f8] focus:ring-2 focus:ring-[#8ab4f8]/20 rounded-2xl px-4 py-3.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
            />
          </div>

          {/* Status Notifications */}
          {status === 'pending' && (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center gap-2.5 text-xs font-semibold text-amber-300 animate-pulse">
              <Clock className="w-4 h-4 text-amber-400" /> Asking host to let you in...
            </div>
          )}

          {status === 'denied' && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-center text-xs font-semibold text-rose-300">
              ❌ The host denied your request to join this meeting.
            </div>
          )}

          {/* Action Buttons: Join Now vs Present */}
          <div className="pt-2 space-y-3">
            <button
              type="button"
              onClick={onJoin}
              disabled={loading || status === 'pending' || !participantName.trim()}
              className="w-full bg-[#1a73e8] hover:bg-[#1b66ca] text-white font-bold py-3.5 sm:py-4 px-4 rounded-2xl shadow-lg shadow-[#1a73e8]/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm cursor-pointer"
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
          <div className="pt-3 border-t border-[#3c4043] flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> End-to-end encrypted WebRTC stream
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
};