import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, Crown, Clock, Sparkles, User, ShieldCheck } from 'lucide-react';

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

  return (
    <div className="min-h-[100dvh] w-full bg-[#090D16] text-white flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans relative overflow-x-hidden select-none">
      {/* Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] bg-indigo-600/15 rounded-full blur-[120px] sm:blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[250px] h-[250px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none hidden sm:block" />

      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-center z-10 py-4 sm:py-0">
        
        {/* Left Column: Camera / Mic Hardware Preview Box */}
        <div className="lg:col-span-7 flex flex-col items-center w-full">
          <div className="relative w-full aspect-video bg-slate-900/90 border border-slate-800/90 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-indigo-950/30 flex items-center justify-center">
            
            {/* Live Media Feed / Off Screen */}
            {cameraOn ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover transform -scale-x-100"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-slate-500 p-6 text-center">
                <div className="p-4 bg-slate-950/60 rounded-full border border-slate-800/80">
                  <VideoOff className="w-8 h-8 sm:w-10 sm:h-10 text-slate-600" />
                </div>
                <span className="text-xs font-semibold tracking-wide text-slate-400">Your camera is off</span>
              </div>
            )}

            {/* Top Status Indicators overlay */}
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-2">
              <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md border ${
                micOn ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${micOn ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                {micOn ? 'Mic On' : 'Muted'}
              </span>
            </div>

            {/* Floating In-Preview Controls */}
            <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-slate-950/85 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-slate-800/80 shadow-xl">
              <button
                type="button"
                onClick={toggleMic}
                title={micOn ? 'Turn off microphone' : 'Turn on microphone'}
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-md ${
                  micOn
                    ? 'bg-slate-800/90 hover:bg-slate-700 text-slate-100 border border-slate-700/60'
                    : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                }`}
              >
                {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={toggleCamera}
                title={cameraOn ? 'Turn off camera' : 'Turn on camera'}
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-md ${
                  cameraOn
                    ? 'bg-slate-800/90 hover:bg-slate-700 text-slate-100 border border-slate-700/60'
                    : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                }`}
              >
                {cameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Join Decisions & Name Entry Card */}
        <div className="lg:col-span-5 w-full bg-slate-900/70 border border-slate-800/80 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-5 sm:p-7 space-y-5 sm:space-y-6 shadow-2xl">
          
          {/* Header Info */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Room #{roomName}
              </span>
              {isHost && (
                <span className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-md text-[11px] font-semibold">
                  <Crown className="w-3 h-3" /> Host
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Ready to join?</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
              Verify your display name and device controls before entering the room.
            </p>
          </div>

          {/* Name Field Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" /> Your Display Name
            </label>
            <input
              type="text"
              placeholder="e.g. Sarah Jenkins"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-500 outline-none transition-all shadow-inner"
            />
          </div>

          {/* Status Notifications */}
          {status === 'pending' && (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center gap-2.5 text-xs font-semibold text-amber-300 animate-pulse">
              <Clock className="w-4 h-4 text-amber-400" /> Asking host to let you in...
            </div>
          )}

          {status === 'denied' && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-center text-xs font-semibold text-rose-300">
              ❌ The host denied your request to join this meeting.
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-1">
            {isHost ? (
              <button
                type="button"
                onClick={onJoin}
                disabled={loading || !participantName.trim()}
                className="w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold py-3.5 sm:py-4 px-4 rounded-xl sm:rounded-2xl shadow-lg shadow-indigo-600/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <Crown className="w-4 h-4 text-amber-300" />
                {loading ? 'Joining Room...' : 'Join now (Host)'}
              </button>
            ) : (
              <button
                type="button"
                onClick={onJoin}
                disabled={loading || status === 'pending' || !participantName.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 sm:py-4 px-4 rounded-xl sm:rounded-2xl shadow-lg shadow-indigo-600/30 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                {loading
                  ? 'Connecting...'
                  : status === 'pending'
                  ? 'Waiting for approval...'
                  : 'Ask to join'}
              </button>
            )}
          </div>

          {/* Encryption Footer Tag */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> End-to-end encrypted WebRTC stream
          </div>
        </div>
      </div>
    </div>
  );
};