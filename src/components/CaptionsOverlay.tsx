import React, { useEffect, useState } from 'react';

interface CaptionsOverlayProps {
  isEnabled: boolean;
  activeSpeakerName?: string;
}

export const CaptionsOverlay: React.FC<CaptionsOverlayProps> = ({
  isEnabled,
  activeSpeakerName = 'Speaker',
}) => {
  const [transcript, setTranscript] = useState<string>('');
  const [currentSpeaker, setCurrentSpeaker] = useState<string>(activeSpeakerName);

  useEffect(() => {
    if (!isEnabled) {
      setTranscript('');
      return;
    }

    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let currentText = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentText += event.results[i][0].transcript;
          }
          if (currentText.trim()) {
            setTranscript(currentText);
            setCurrentSpeaker(activeSpeakerName || 'You');
          }
        };

        recognition.onerror = (e: any) => {
          console.warn('Speech recognition error:', e);
        };

        recognition.start();

        return () => {
          try {
            recognition.stop();
          } catch (e) {
            // ignore
          }
        };
      } catch (err) {
        console.warn('Could not initialize SpeechRecognition:', err);
      }
    } else {
      setTranscript('Captions are active. (Speech recognition is listening...)');
      const timer = setTimeout(() => {
        setTranscript('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isEnabled, activeSpeakerName]);

  if (!isEnabled || !transcript) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30 max-w-2xl w-[calc(100%-2rem)] flex justify-center pointer-events-none select-none animate-in fade-in duration-200">
      <div className="bg-white/95 border border-[#dadce0] backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl flex items-start gap-3 text-[#202124] max-w-xl">
        <div className="w-6 h-6 rounded-full bg-[#e8f0fe] border border-[#d2e3fc] flex items-center justify-center text-[10px] font-bold text-[#1967d2] shrink-0 mt-0.5 shadow-2xs">
          {currentSpeaker.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold text-[#1a73e8] leading-tight">{currentSpeaker}</p>
          <p className="text-xs sm:text-sm text-[#202124] font-medium leading-relaxed mt-0.5">{transcript}</p>
        </div>
      </div>
    </div>
  );
};
