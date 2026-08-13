import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, Crown, Clock, Sparkles } from 'lucide-react';

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
    <div className="min-h-screen w-full bg-[#090D16] text-white flex items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        
        {/* Camera / Mic Controls */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="relative w-full aspect-video bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center">
            {cameraOn ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover transform -scale-x-100"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-500">
                <VideoOff className="w-12 h-12" />
                <span className="text-xs font-semibold">Camera is off</span>
              </div>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-800 shadow-lg">
              <button
                type="button"
                onClick={toggleMic}
                className={`p-3 rounded-xl transition-all cursor-pointer ${
                  micOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-rose-500 text-white'
                }`}
              >
                {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={toggleCamera}
                className={`p-3 rounded-xl transition-all cursor-pointer ${
                  cameraOn ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-rose-500 text-white'
                }`}
              >
                {cameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Join Decisions Box */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800/80 backdrop-blur-2xl rounded-3xl p-8 space-y-6 shadow-2xl">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Room #{roomName}
            </span>
            <h2 className="text-2xl font-bold text-white">Ready to join?</h2>
            <p className="text-xs text-slate-400 mt-1">
              Check your audio and video before entering the call.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Your Display Name
            </label>
            <input
              type="text"
              placeholder="e.g. Sarah Jenkins"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all"
            />
          </div>

          {status === 'pending' && (
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center gap-2 text-xs font-medium text-amber-300 animate-pulse">
              <Clock className="w-4 h-4" /> Asking host to let you in...
            </div>
          )}

          {status === 'denied' && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-center text-xs font-medium text-rose-300">
              ❌ The host denied your request to join.
            </div>
          )}

          <div className="pt-2">
            {isHost ? (
              <button
                type="button"
                onClick={onJoin}
                disabled={loading || !participantName.trim()}
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-600/25 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <Crown className="w-4 h-4 text-amber-300" />
                {loading ? 'Joining...' : 'Join now'}
              </button>
            ) : (
              <button
                type="button"
                onClick={onJoin}
                disabled={loading || status === 'pending' || !participantName.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-600/25 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                {loading
                  ? 'Connecting...'
                  : status === 'pending'
                  ? 'Waiting for approval...'
                  : 'Ask to join'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};