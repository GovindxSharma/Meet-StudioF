import React, { useState, useEffect } from 'react';
import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import '@livekit/components-styles';

import { MeetLanding } from './components/MeetLanding';
import { MeetingHeader } from './components/MeetingHeader';
import { HostApprovalBanner } from './components/HostApprovalBanner';

const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL || 'wss://project-g-meet-3p15qlur.livekit.cloud';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export default function App() {
  const [roomInput, setRoomInput] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [activeRoomName, setActiveRoomName] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'pending' | 'denied'>('idle');
  const [pendingGuests, setPendingGuests] = useState<any[]>([]);

  // Track hosted rooms in LocalStorage
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

  // Helper to extract room code from URLs or raw strings
  const extractRoomCode = (input: string) => {
    const trimmed = input.trim();
    if (trimmed.includes('/room/')) {
      return trimmed.split('/room/')[1].split('?')[0];
    }
    return trimmed;
  };

  // 1. Parse Room Code on direct URL paste load (e.g. https://meet-studiof.onrender.com/room/abc-defg-hij)
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/room/')) {
      const codeFromUrl = path.split('/room/')[1]?.split('?')[0]?.trim();
      if (codeFromUrl) {
        setRoomInput(codeFromUrl);
      }
    }
  }, []);

  // 2. Guest Interval Polling for Waiting Room Approval
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

  // 3. Host Interval Polling for Pending Guests
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

  // Action: Start Instant Meeting as Host
  const handleStartInstantMeeting = async () => {
    if (!participantName.trim()) {
      alert('Please enter your display name first.');
      return;
    }

    const newRoomCode = Math.random().toString(36).substring(2, 11);
    setActiveRoomName(newRoomCode);
    markRoomAsHosted(newRoomCode);
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/create-room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: newRoomCode, hostName: participantName }),
      });

      const data = await response.json();
      if (data.token) {
        setToken(data.token);
        setIsHost(true);
        window.history.pushState({}, '', `/room/${newRoomCode}`);
      }
    } catch (err) {
      console.error('Failed to create instant room:', err);
    } finally {
      setLoading(false);
    }
  };

  // Action: Join room via link/code
  const handleJoinWithCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!participantName.trim()) {
      alert('Please enter your display name first.');
      return;
    }

    const roomCode = extractRoomCode(roomInput);
    if (!roomCode) return;

    setActiveRoomName(roomCode);
    setLoading(true);

    const userIsHost = isRoomHost(roomCode);

    try {
      if (userIsHost) {
        // Direct Join as Host
        const response = await fetch(`${BACKEND_URL}/api/create-room`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomName: roomCode, hostName: participantName }),
        });

        const data = await response.json();
        if (data.token) {
          setToken(data.token);
          setIsHost(true);
          window.history.pushState({}, '', `/room/${roomCode}`);
        }
      } else {
        // Request Join as Guest (Enter Waiting Room)
        const response = await fetch(`${BACKEND_URL}/api/request-join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomName: roomCode, participantName }),
        });

        const data = await response.json();
        if (data.status === 'pending') {
          setStatus('pending');
        } else if (data.status === 'approved' && data.token) {
          setToken(data.token);
          setStatus('idle');
        }
      }
    } catch (err) {
      console.error('Failed to join room:', err);
    } finally {
      setLoading(false);
    }
  };

  // Host Action: Approve or Deny Guest
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
  if (!token) {
    return (
      <MeetLanding
        roomInput={roomInput}
        setRoomInput={setRoomInput}
        participantName={participantName}
        setParticipantName={setParticipantName}
        onStartInstantMeeting={handleStartInstantMeeting}
        onJoinWithCode={handleJoinWithCode}
        loading={loading}
        status={status}
      />
    );
  }

  // View 2: Live Call Canvas
  return (
    <div className="flex flex-col h-screen w-screen bg-[#090D16] overflow-hidden font-sans">
      <MeetingHeader
        roomName={activeRoomName || ''}
        participantName={participantName}
        isHost={isHost}
        onLeave={() => {
          setToken(null);
          setIsHost(false);
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
          token={token}
          serverUrl={LIVEKIT_URL}
          data-lk-theme="default"
          onDisconnected={() => {
            setToken(null);
            setIsHost(false);
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