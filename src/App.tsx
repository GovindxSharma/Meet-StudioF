import React, { useState, useEffect } from 'react';
import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import '@livekit/components-styles';

import { MeetLanding } from './components/MeetLanding';
import { MeetingHeader } from './components/MeetingHeader';
import { HostApprovalBanner } from './components/HostApprovalBanner';
import { GreenRoomPreview } from './components/GreenRoomPreview';

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

  // 2. Guest Approval Polling
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

  // 3. Host Pending Guests Polling
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
        // Direct Join as Host
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

      // Guest Request Join
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

  // Moderate Guest Action
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

  // View 1: Landing Page
  if (!inGreenRoom && !token) {
    return (
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

  // View 3: Live Video Call Canvas
  return (
    <div className="flex flex-col h-screen w-screen bg-[#090D16] overflow-hidden font-sans">
      <MeetingHeader
        roomName={activeRoomName || ''}
        participantName={participantName}
        isHost={isHost}
        onLeave={() => {
          setToken(null);
          setIsHost(false);
          setInGreenRoom(false);
          setStatus('idle');
          window.history.pushState({}, '', '/');
        }}
      />

      {isHost && (
        <HostApprovalBanner
          pendingGuests={pendingGuests}
          onApprove={(guest) => handleModerateGuest(guest, 'approve')}
          onDeny={(guest) => handleModerateGuest(guest, 'deny')}
        />
      )}

      <main className="flex-1 relative w-full h-[calc(100vh-4rem)]">
        <LiveKitRoom
          video={true}
          audio={true}
          token={token || undefined}
          serverUrl={LIVEKIT_URL}
          data-lk-theme="default"
          onDisconnected={() => {
            setToken(null);
            setIsHost(false);
            setInGreenRoom(false);
            setStatus('idle');
            window.history.pushState({}, '', '/');
          }}
          style={{ height: '100%' }}
        >
          <VideoConference />
        </LiveKitRoom>
      </main>
    </div>
  );
}