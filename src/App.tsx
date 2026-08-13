import React, { useState, useEffect } from 'react';
import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import '@livekit/components-styles';
import { ShieldAlert, RotateCcw, X } from 'lucide-react';

import { MeetLanding } from './components/MeetLanding';
import { MeetingHeader } from './components/MeetingHeader';
import { HostApprovalBanner } from './components/HostApprovalBanner';
import { GreenRoomPreview } from './components/GreenRoomPreview';
import { HostControlsDrawer } from './components/HostControlsDrawer';
import { LeaveConfirmModal } from './components/LeaveConfirmModal';

const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL || 'wss://project-g-meet-3p15qlur.livekit.cloud';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export default function App() {
  const [roomInput, setRoomInput] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [activeRoomName, setActiveRoomName] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [inGreenRoom, setInGreenRoom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'pending' | 'denied'>('idle');
  const [pendingGuests, setPendingGuests] = useState<any[]>([]);

  // Mobile & Rejoin State
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [rejoinRoom, setRejoinRoom] = useState<{ roomName: string; token: string } | null>(null);
  const [showHostDrawer, setShowHostDrawer] = useState(false);

  // Helpers for host check
  const markRoomAsHosted = (code: string) => {
    const hostedRooms = JSON.parse(localStorage.getItem('hosted_rooms') || '[]');
    if (!hostedRooms.includes(code)) {
      hostedRooms.push(code);
      localStorage.setItem('hosted_rooms', JSON.stringify(hostedRooms));
    }
  };

  const isRoomHost = (code: string) => {
    const hostedRooms = JSON.parse(localStorage.getItem('hosted_rooms') || '[]');
    return hostedRooms.includes(code);
  };

  const extractRoomDetailsFromUrl = () => {
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    let hostTokenFromUrl = searchParams.get('token');

    if (path.includes('/room/')) {
      const codeFromUrl = path.split('/room/')[1]?.split('?')[0]?.trim();
      if (!hostTokenFromUrl && codeFromUrl) {
        hostTokenFromUrl = localStorage.getItem(`host_token_${codeFromUrl}`);
      }
      return { codeFromUrl, hostTokenFromUrl };
    }
    return { codeFromUrl: null, hostTokenFromUrl: null };
  };

  // 1. Initial Page Load URL Detection
  useEffect(() => {
    const { codeFromUrl, hostTokenFromUrl } = extractRoomDetailsFromUrl();
    if (codeFromUrl) {
      setActiveRoomName(codeFromUrl);
      setInGreenRoom(true);
      if (hostTokenFromUrl || isRoomHost(codeFromUrl)) {
        setIsHost(true);
      }
    }
  }, []);

  // 2. Intercept Hardware Back Button / Swiping Back on Mobile Browsers
  useEffect(() => {
    if (token) {
      window.history.pushState(null, '', window.location.href);

      const handlePopState = (e: PopStateEvent) => {
        e.preventDefault();
        setShowLeaveModal(true);
        window.history.pushState(null, '', window.location.href);
      };

      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [token]);

  // 3. Auto-dismiss Rejoin Toast after 15 Seconds
  useEffect(() => {
    if (rejoinRoom) {
      const timer = setTimeout(() => {
        setRejoinRoom(null);
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [rejoinRoom]);

  // 4. Guest Approval Polling
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (status === 'pending' && activeRoomName && participantName) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`${BACKEND_URL}/api/check-approval`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomName: activeRoomName, participantName }),
          });

          const data = await res.json();
          if (data.status === 'approved' && data.token) {
            setToken(data.token);
            setInGreenRoom(false);
            setStatus('idle');
            setLoading(false);
          } else if (data.status === 'denied') {
            setStatus('denied');
            setLoading(false);
          }
        } catch (err) {
          console.error('Error checking approval status:', err);
        }
      }, 2000);
    }

    return () => clearInterval(interval);
  }, [status, activeRoomName, participantName]);

  // 5. Host Pending Guests Polling
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (token && isHost && activeRoomName) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`${BACKEND_URL}/api/waiting-list/${activeRoomName}`);
          const data = await res.json();
          if (data.pending) {
            setPendingGuests(data.pending);
          }
        } catch (err) {
          console.error('Error fetching waiting list:', err);
        }
      }, 3000);
    }

    return () => clearInterval(interval);
  }, [token, isHost, activeRoomName]);

  // Action: Create Meeting Link for Later
  const handleCreateLinkForLater = async (): Promise<string | null> => {
    if (!participantName.trim()) {
      alert('Please enter your display name first.');
      return null;
    }

    const rand = (len: number) =>
      Array.from({ length: len }, () => 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]).join('');
    const newRoomCode = `${rand(3)}-${rand(4)}-${rand(3)}`;

    try {
      const response = await fetch(`${BACKEND_URL}/api/create-room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: newRoomCode, hostName: participantName }),
      });

      const data = await response.json();
      if (data.token || data.hostToken) {
        markRoomAsHosted(newRoomCode);
        if (data.hostToken) {
          localStorage.setItem(`host_token_${newRoomCode}`, data.hostToken);
        }
        const hostLink = `${window.location.origin}/room/${newRoomCode}${data.hostToken ? `?token=${data.hostToken}` : ''}`;
        await navigator.clipboard.writeText(hostLink);
        return hostLink;
      }
    } catch (err) {
      console.error('Failed to create room for later:', err);
    }
    return null;
  };

  // Action: Start Instant Meeting as Host
  const handleStartInstantMeeting = async () => {
    if (!participantName.trim()) {
      alert('Please enter your display name first.');
      return;
    }

    const rand = (len: number) =>
      Array.from({ length: len }, () => 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]).join('');
    const newRoomCode = `${rand(3)}-${rand(4)}-${rand(3)}`;

    setActiveRoomName(newRoomCode);
    markRoomAsHosted(newRoomCode);
    setIsHost(true);
    setInGreenRoom(true);
    window.history.pushState({}, '', `/room/${newRoomCode}`);
  };

  // Action: Join from Landing Page Form
  const handleJoinWithCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!participantName.trim()) {
      alert('Please enter your display name first.');
      return;
    }

    const roomCode = roomInput.trim().split('/room/').pop()?.split('?')[0];
    if (!roomCode) return;

    setActiveRoomName(roomCode);
    setIsHost(isRoomHost(roomCode));
    window.history.pushState({}, '', `/room/${roomCode}`);
    setInGreenRoom(true);
  };

  // Action: Execute Join from Green Room
  const handleGreenRoomJoin = async () => {
    if (!activeRoomName || !participantName.trim()) {
      alert('Please enter your display name first.');
      return;
    }

    const { hostTokenFromUrl } = extractRoomDetailsFromUrl();
    const userIsHost = isHost || isRoomHost(activeRoomName) || Boolean(hostTokenFromUrl);
    setLoading(true);

    try {
      if (userIsHost) {
        const response = await fetch(`${BACKEND_URL}/api/create-room`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomName: activeRoomName, hostName: participantName }),
        });

        const data = await response.json();
        if (data.token) {
          setToken(data.token);
          setIsHost(true);
          setInGreenRoom(false);
          setLoading(false);
          return;
        }
      }

      const response = await fetch(`${BACKEND_URL}/api/request-join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: activeRoomName, participantName }),
      });

      const data = await response.json();
      if (data.status === 'pending') {
        setStatus('pending');
      } else if (data.status === 'approved' && data.token) {
        setToken(data.token);
        setInGreenRoom(false);
        setStatus('idle');
      }
    } catch (err) {
      console.error('Failed to join room:', err);
    } finally {
      setLoading(false);
    }
  };

  // Confirm Leave Execution
  const handleConfirmLeave = () => {
    if (activeRoomName && token) {
      setRejoinRoom({ roomName: activeRoomName, token });
    }
    setShowLeaveModal(false);
    setToken(null);
    setIsHost(false);
    setInGreenRoom(false);
    setStatus('idle');
    window.history.pushState({}, '', '/');
  };

  // Host Actions
  const handleModerateGuest = async (targetGuest: string, action: 'approve' | 'deny') => {
    try {
      await fetch(`${BACKEND_URL}/api/moderate-guest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: activeRoomName, participantName: targetGuest, action }),
      });

      setPendingGuests((prev) => prev.filter((p) => p.participantName !== targetGuest));
    } catch (err) {
      console.error('Failed to moderate guest:', err);
    }
  };

  const handleHostMuteAll = async () => {
    alert('All participants muted.');
  };

  const handleHostRemoveParticipant = async (identity: string) => {
    alert(`Participant ${identity} removed.`);
  };

  // View 1: Landing Page (With Floating Rejoin Toast)
  if (!inGreenRoom && !token) {
    return (
      <div className="relative min-h-[100dvh] w-full bg-[#090D16]">
        <MeetLanding
          roomInput={roomInput}
          setRoomInput={setRoomInput}
          participantName={participantName}
          setParticipantName={setParticipantName}
          onStartInstantMeeting={handleStartInstantMeeting}
          onCreateLinkForLater={handleCreateLinkForLater}
          onJoinWithCode={handleJoinWithCode}
          loading={loading}
          status={status}
        />

        {/* Floating Rejoin Banner Notification */}
        {rejoinRoom && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 border border-indigo-500/40 backdrop-blur-2xl p-3.5 sm:p-4 rounded-2xl shadow-2xl shadow-indigo-950/50 flex items-center justify-between gap-4 max-w-[calc(100vw-2rem)] sm:max-w-sm w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-bold text-white truncate">Left #{rejoinRoom.roomName}</p>
              <p className="text-[11px] text-slate-400 truncate">Tap rejoin to re-enter call</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setToken(rejoinRoom.token);
                  setActiveRoomName(rejoinRoom.roomName);
                  setRejoinRoom(null);
                }}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-3 py-2 rounded-xl text-xs active:scale-95 transition-all shadow-md shadow-indigo-600/30 cursor-pointer min-h-[36px]"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Rejoin
              </button>

              <button
                type="button"
                onClick={() => setRejoinRoom(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // View 2: Green Room Preview Screen
  if (inGreenRoom && !token) {
    return (
      <GreenRoomPreview
        roomName={activeRoomName || ''}
        participantName={participantName}
        setParticipantName={setParticipantName}
        isHost={isHost}
        onJoin={handleGreenRoomJoin}
        loading={loading}
        status={status}
      />
    );
  }

  // View 3: Live Video Call Canvas (Dynamic 100dvh viewport container)
  return (
    <div className="flex flex-col h-[100dvh] w-screen bg-[#090D16] overflow-hidden font-sans relative select-none">
      <MeetingHeader
        roomName={activeRoomName || ''}
        participantName={participantName}
        isHost={isHost}
        onLeave={() => setShowLeaveModal(true)}
      />

      {isHost && (
        <HostApprovalBanner
          pendingGuests={pendingGuests}
          onApprove={(guest) => handleModerateGuest(guest, 'approve')}
          onDeny={(guest) => handleModerateGuest(guest, 'deny')}
        />
      )}

      {/* Main LiveKit Container */}
      <main className="flex-1 relative w-full h-[calc(100dvh-4rem)] overflow-hidden">
        <LiveKitRoom
          video={true}
          audio={true}
          token={token || undefined}
          serverUrl={LIVEKIT_URL}
          data-lk-theme="default"
          onDisconnected={() => setShowLeaveModal(true)}
          style={{ height: '100%', width: '100%' }}
        >
          <VideoConference />
        </LiveKitRoom>

        {/* Floating Host Controls Trigger Button */}
        {isHost && (
          <button
            type="button"
            onClick={() => setShowHostDrawer(true)}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl shadow-xl flex items-center gap-1.5 text-xs active:scale-95 transition-all cursor-pointer min-h-[36px]"
          >
            <ShieldAlert className="w-4 h-4" /> 
            <span className="hidden sm:inline">Host Tools</span>
          </button>
        )}
      </main>

      {/* Mobile Leave Confirmation Dialog */}
      <LeaveConfirmModal
        isOpen={showLeaveModal}
        onCancel={() => setShowLeaveModal(false)}
        onConfirm={handleConfirmLeave}
      />

      {/* Slide-Up Host Controls Drawer */}
      <HostControlsDrawer
        isOpen={showHostDrawer}
        onClose={() => setShowHostDrawer(false)}
        participants={[]}
        onMuteAll={handleHostMuteAll}
        onRemoveParticipant={handleHostRemoveParticipant}
      />
    </div>
  );
}