import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, Volume2, Video, Bell, Play, Check } from 'lucide-react';
import { soundManager } from '../utils/soundUtils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'audio' | 'video' | 'general'>('audio');
  
  // Devices state
  const [audioInputs, setAudioInputs] = useState<MediaDeviceInfo[]>([]);
  const [audioOutputs, setAudioOutputs] = useState<MediaDeviceInfo[]>([]);
  const [videoInputs, setVideoInputs] = useState<MediaDeviceInfo[]>([]);

  const [selectedAudioInput, setSelectedAudioInput] = useState<string>('');
  const [selectedAudioOutput, setSelectedAudioOutput] = useState<string>('');
  const [selectedVideoInput, setSelectedVideoInput] = useState<string>('');

  // Audio level meter
  const [micLevel, setMicLevel] = useState<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Video preview
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);

  // Sound effects toggle
  const [soundsEnabled, setSoundsEnabled] = useState<boolean>(soundManager.isSoundEnabled());
  const [playingTestTone, setPlayingTestTone] = useState(false);

  // Enumerate devices on open
  useEffect(() => {
    if (!isOpen) return;

    const loadDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        
        const mics = devices.filter((d) => d.kind === 'audioinput');
        const speakers = devices.filter((d) => d.kind === 'audiooutput');
        const cams = devices.filter((d) => d.kind === 'videoinput');

        setAudioInputs(mics);
        setAudioOutputs(speakers);
        setVideoInputs(cams);

        if (mics.length > 0 && !selectedAudioInput) setSelectedAudioInput(mics[0].deviceId);
        if (speakers.length > 0 && !selectedAudioOutput) setSelectedAudioOutput(speakers[0].deviceId);
        if (cams.length > 0 && !selectedVideoInput) setSelectedVideoInput(cams[0].deviceId);
      } catch (err) {
        console.error('Error enumerating devices:', err);
      }
    };

    loadDevices();
  }, [isOpen, selectedAudioInput, selectedAudioOutput, selectedVideoInput]);

  // Audio Meter Setup
  useEffect(() => {
    if (!isOpen || activeTab !== 'audio') {
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
        micStreamRef.current = null;
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      return;
    }

    const startMicMeter = async () => {
      try {
        const constraints = {
          audio: selectedAudioInput ? { deviceId: { exact: selectedAudioInput } } : true,
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        micStreamRef.current = stream;

        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;

        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const checkVolume = () => {
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
      } catch (err) {
        console.warn('Could not test microphone:', err);
      }
    };

    startMicMeter();

    return () => {
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
        micStreamRef.current = null;
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isOpen, activeTab, selectedAudioInput]);

  // Video Preview Setup
  useEffect(() => {
    if (!isOpen || activeTab !== 'video') {
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach((t) => t.stop());
        videoStreamRef.current = null;
      }
      return;
    }

    const startCamPreview = async () => {
      try {
        const constraints = {
          video: selectedVideoInput ? { deviceId: { exact: selectedVideoInput } } : true,
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        videoStreamRef.current = stream;
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn('Could not start video preview:', err);
      }
    };

    startCamPreview();

    return () => {
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach((t) => t.stop());
        videoStreamRef.current = null;
      }
    };
  }, [isOpen, activeTab, selectedVideoInput]);

  if (!isOpen) return null;

  const handleTestSpeaker = () => {
    setPlayingTestTone(true);
    soundManager.playTestTone();
    setTimeout(() => setPlayingTestTone(false), 800);
  };

  const handleToggleSound = (enabled: boolean) => {
    setSoundsEnabled(enabled);
    soundManager.setSoundEnabled(enabled);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 select-none font-sans"
      onClick={onClose}
    >
      <div
        className="bg-white border border-[#dadce0] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#dadce0]">
          <h2 className="text-lg font-bold text-[#202124] tracking-tight">Settings</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#5f6368] hover:text-[#202124] rounded-full hover:bg-[#f1f3f4] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-[#dadce0] px-6 gap-6 bg-[#f8f9fa]">
          <button
            type="button"
            onClick={() => setActiveTab('audio')}
            className={`py-3.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'audio'
                ? 'border-[#1a73e8] text-[#1a73e8]'
                : 'border-transparent text-[#5f6368] hover:text-[#202124]'
            }`}
          >
            <Mic className="w-4 h-4" /> Audio
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('video')}
            className={`py-3.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'video'
                ? 'border-[#1a73e8] text-[#1a73e8]'
                : 'border-transparent text-[#5f6368] hover:text-[#202124]'
            }`}
          >
            <Video className="w-4 h-4" /> Video
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`py-3.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'general'
                ? 'border-[#1a73e8] text-[#1a73e8]'
                : 'border-transparent text-[#5f6368] hover:text-[#202124]'
            }`}
          >
            <Bell className="w-4 h-4" /> General & Sounds
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-[#202124] bg-white">
          {/* TAB 1: AUDIO */}
          {activeTab === 'audio' && (
            <div className="space-y-5">
              {/* Microphone Section */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#5f6368] flex items-center gap-2">
                  <Mic className="w-4 h-4 text-[#1a73e8]" /> Microphone
                </label>
                <select
                  value={selectedAudioInput}
                  onChange={(e) => setSelectedAudioInput(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#dadce0] focus:border-[#1a73e8] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#202124] outline-none cursor-pointer shadow-2xs"
                >
                  {audioInputs.map((d, i) => (
                    <option key={d.deviceId || i} value={d.deviceId}>
                      {d.label || `Microphone ${i + 1}`}
                    </option>
                  ))}
                  {audioInputs.length === 0 && <option value="">Default Microphone</option>}
                </select>

                {/* Mic Volume Meter */}
                <div className="pt-2 flex items-center gap-3">
                  <span className="text-[11px] font-medium text-[#5f6368] shrink-0">Input Level:</span>
                  <div className="flex-1 h-2 bg-[#f1f3f4] rounded-full overflow-hidden border border-[#dadce0]">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 via-yellow-400 to-rose-500 transition-all duration-75"
                      style={{ width: `${micLevel}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-mono text-[#5f6368] w-8 text-right font-bold">{micLevel}%</span>
                </div>
              </div>

              {/* Speakers Section */}
              <div className="space-y-2 pt-3 border-t border-[#f1f3f4]">
                <label className="text-xs font-bold uppercase tracking-wider text-[#5f6368] flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-[#1a73e8]" /> Speakers / Output
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedAudioOutput}
                    onChange={(e) => setSelectedAudioOutput(e.target.value)}
                    className="flex-1 bg-[#f8f9fa] border border-[#dadce0] focus:border-[#1a73e8] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#202124] outline-none cursor-pointer shadow-2xs"
                  >
                    {audioOutputs.map((d, i) => (
                      <option key={d.deviceId || i} value={d.deviceId}>
                        {d.label || `Speaker ${i + 1}`}
                      </option>
                    ))}
                    {audioOutputs.length === 0 && <option value="">Default Audio Output</option>}
                  </select>
                  <button
                    type="button"
                    onClick={handleTestSpeaker}
                    className="bg-[#e8f0fe] hover:bg-[#d2e3fc] text-[#1967d2] border border-[#d2e3fc] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0 shadow-2xs"
                  >
                    <Play className={`w-3.5 h-3.5 ${playingTestTone ? 'animate-spin' : ''}`} />
                    <span>Test</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VIDEO */}
          {activeTab === 'video' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#5f6368] flex items-center gap-2">
                  <Video className="w-4 h-4 text-[#1a73e8]" /> Camera Device
                </label>
                <select
                  value={selectedVideoInput}
                  onChange={(e) => setSelectedVideoInput(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-[#dadce0] focus:border-[#1a73e8] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#202124] outline-none cursor-pointer shadow-2xs"
                >
                  {videoInputs.map((d, i) => (
                    <option key={d.deviceId || i} value={d.deviceId}>
                      {d.label || `Camera ${i + 1}`}
                    </option>
                  ))}
                  {videoInputs.length === 0 && <option value="">Default Camera</option>}
                </select>
              </div>

              {/* Video Preview Box */}
              <div className="relative aspect-video bg-[#202124] border border-[#dadce0] rounded-2xl overflow-hidden flex items-center justify-center shadow-md">
                <video
                  ref={videoPreviewRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover transform -scale-x-100"
                />
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-white font-mono">
                  Live Camera Test
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GENERAL & SOUNDS */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#f8f9fa] border border-[#dadce0] rounded-2xl shadow-2xs">
                <div>
                  <h4 className="text-sm font-bold text-[#202124]">Audio Notifications & Sound Effects</h4>
                  <p className="text-xs text-[#5f6368] mt-0.5">
                    Play audio cues when users join, leave, raise hand, or send chat in Meet Studio
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleSound(!soundsEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                    soundsEnabled ? 'bg-[#1a73e8]' : 'bg-[#dadce0]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform transform absolute top-0.5 ${
                      soundsEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="p-4 bg-[#f8f9fa] border border-[#dadce0] rounded-2xl space-y-2.5 shadow-2xs">
                <h4 className="text-sm font-bold text-[#202124]">Keyboard Shortcuts</h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-[#3c4043]">
                  <div className="flex items-center justify-between bg-white border border-[#dadce0] p-2.5 rounded-xl shadow-2xs">
                    <span>Mute / Unmute Mic</span>
                    <kbd className="px-2 py-0.5 bg-[#f1f3f4] border border-[#dadce0] rounded text-[10px] font-mono font-bold text-[#202124]">Ctrl+D</kbd>
                  </div>
                  <div className="flex items-center justify-between bg-white border border-[#dadce0] p-2.5 rounded-xl shadow-2xs">
                    <span>Turn Cam On / Off</span>
                    <kbd className="px-2 py-0.5 bg-[#f1f3f4] border border-[#dadce0] rounded text-[10px] font-mono font-bold text-[#202124]">Ctrl+E</kbd>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#dadce0] flex justify-end bg-white">
          <button
            type="button"
            onClick={onClose}
            className="bg-[#1a73e8] hover:bg-[#1b66ca] text-white font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Check className="w-4 h-4" />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};
