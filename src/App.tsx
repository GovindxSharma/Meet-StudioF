import React, { useState, useEffect, useRef } from 'react';
import { LiveKitRoom, useRoomContext } from '@livekit/components-react';
import '@livekit/components-styles';
import { RotateCcw, X } from 'lucide-react';

import { MeetLanding } from './components/MeetLanding';
import { GreenRoomPreview } from './components/GreenRoomPreview';
import { MeetingStage } from './components/MeetingStage';
import { MeetingControlBar } from './components/MeetingControlBar';
import { HostApprovalBanner } from './components/HostApprovalBanner';
import { InCallChatDrawer, type ChatMessage } from './components/InCallChatDrawer';
import { PeopleDrawer } from './components/PeopleDrawer';
import { ActivitiesDrawer } from './components/ActivitiesDrawer';
import { MeetingDetailsDrawer } from './components/MeetingDetailsDrawer';
import { HostControlsDrawer } from './components/HostControlsDrawer';
import { LeaveConfirmModal } from './components/LeaveConfirmModal';
import { HostDataListener } from './components/HostDataListener';
import { SettingsModal } from './components/SettingsModal';
import { CaptionsOverlay } from './components/CaptionsOverlay';
import { EmojiReactionsOverlay, type FloatingReaction } from './components/EmojiReactions';
import { ToastContainer, type ToastMessage } from './components/Toast';
import { AboutPage } from './components/AboutPage';
import { soundManager } from './utils/soundUtils';

const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL || 'wss://project-g-meet-3p15qlur.livekit.cloud';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

// Internal helper to capture the active LiveKit room instance
const RoomContextBinder: React.FC<{ onRoomReady: (room: any) => void }> = ({ onRoomReady }) => {
  const room = useRoomContext();
  useEffect(() => {
    if (room) {
      onRoomReady(room);
    }
  }, [room, onRoomReady]);
  return null;
};

export default function App() {
  const [roomInput, setRoomInput] = useState('');
  const [participantName, setParticipantName] = useState(() => localStorage.getItem('user_display_name') || '');
  const [activeRoomName, setActiveRoomName] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [inGreenRoom, setInGreenRoom] = useState(false);
  const [showAboutPage, setShowAboutPage] = useState(() => window.location.pathname === '/about');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'pending' | 'denied'>('idle');
  const [pendingGuests, setPendingGuests] = useState<any[]>([]);

  // Modals & Sidebars
  const [activeSidebar, setActiveSidebar] = useState<'details' | 'people' | 'chat' | 'activities' | 'host' | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [rejoinRoom, setRejoinRoom] = useState<{ roomName: string; token: string } | null>(null);

  // In-Call Interactive State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [handRaisedUsers, setHandRaisedUsers] = useState<string[]>([]);
  const [isLocalHandRaised, setIsLocalHandRaised] = useState(false);
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [externalDrawData, setExternalDrawData] = useState<any>(null);

  const roomInstanceRef = useRef<any>(null);

  const addToast = (message: string, type: ToastMessage['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Helper to save recent meetings
  const saveRecentMeeting = (code: string) => {
    try {
      const saved = JSON.parse(localStorage.getItem('gmeet_recent_meetings') || '[]');
      const filtered = saved.filter((m: any) => m.code !== code);
      filtered.unshift({
        code,
        date: new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }),
      });
      localStorage.setItem('gmeet_recent_meetings', JSON.stringify(filtered.slice(0, 10)));
    } catch (e) {
      // ignore
    }
  };

  // Helper for host checking
  const markRoomAsHosted = (code: string) => {
    const hostedRooms = JSON.parse(localStorage.getItem('hosted_rooms') || '[]');
    if (!hostedRooms.includes(code)) {
      hostedRooms.push(code);
      localStorage.setItem('hosted_rooms', JSON.stringify(hostedRooms));
    }
    saveRecentMeeting(code);
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

  // 2. Clear unread messages when chat sidebar is opened
  useEffect(() => {
    if (activeSidebar === 'chat') {
      setUnreadMessages(0);
    }
  }, [activeSidebar]);

  // 3. Auto-remove expired emoji reactions
  useEffect(() => {
    if (reactions.length === 0) return;
    const timer = setInterval(() => {
      const now = Date.now();
      setReactions((prev) => prev.filter((r) => now - r.createdAt < 3000));
    }, 1000);
    return () => clearInterval(timer);
  }, [reactions]);

  // 4. Auto-dismiss Rejoin Toast
  useEffect(() => {
    if (rejoinRoom) {
      const timer = setTimeout(() => setRejoinRoom(null), 15000);
      return () => clearTimeout(timer);
    }
  }, [rejoinRoom]);

  // 5. Guest Approval Polling
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
            soundManager.playJoin();
            addToast('Admitted to the meeting!', 'success');
          } else if (data.status === 'denied') {
            setStatus('denied');
            setLoading(false);
            addToast('The host denied your join request.', 'error');
          }
        } catch (err) {
          console.error('Error checking approval status:', err);
        }
      }, 2000);
    }

    return () => clearInterval(interval);
  }, [status, activeRoomName, participantName]);

  // 6. Host Pending Guests Polling
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
      }, 2500);
    }

    return () => clearInterval(interval);
  }, [token, isHost, activeRoomName]);

  // ACTION: Create Link for Later
  const handleCreateLinkForLater = async (): Promise<string | null> => {
    if (!participantName.trim()) {
      addToast('Please enter your display name first.', 'warning');
      return null;
    }
    localStorage.setItem('user_display_name', participantName);

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
        const hostLink = `${window.location.origin}/room/${newRoomCode}`;
        await navigator.clipboard.writeText(hostLink);
        addToast('Meeting link copied to clipboard!', 'success');
        return hostLink;
      }
    } catch (err) {
      console.error('Failed to create room for later:', err);
      addToast('Failed to generate meeting link.', 'error');
    }
    return null;
  };

  // ACTION: Start Instant Meeting
  const handleStartInstantMeeting = async () => {
    if (!participantName.trim()) {
      addToast('Please enter your display name first.', 'warning');
      return;
    }
    localStorage.setItem('user_display_name', participantName);

    const rand = (len: number) =>
      Array.from({ length: len }, () => 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]).join('');
    const newRoomCode = `${rand(3)}-${rand(4)}-${rand(3)}`;

    setActiveRoomName(newRoomCode);
    markRoomAsHosted(newRoomCode);
    setIsHost(true);
    setInGreenRoom(true);
    window.history.pushState({}, '', `/room/${newRoomCode}`);
  };

  // ACTION: Join from Landing Form
  const handleJoinWithCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!participantName.trim()) {
      addToast('Please enter your display name first.', 'warning');
      return;
    }
    localStorage.setItem('user_display_name', participantName);

    const roomCode = roomInput.trim().split('/room/').pop()?.split('?')[0];
    if (!roomCode) {
      addToast('Invalid meeting link or code.', 'warning');
      return;
    }

    setActiveRoomName(roomCode);
    setIsHost(isRoomHost(roomCode));
    saveRecentMeeting(roomCode);
    window.history.pushState({}, '', `/room/${roomCode}`);
    setInGreenRoom(true);
  };

  // ACTION: Join from Green Room
  const handleGreenRoomJoin = async () => {
    if (!activeRoomName || !participantName.trim()) {
      addToast('Please enter your display name first.', 'warning');
      return;
    }
    localStorage.setItem('user_display_name', participantName);

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
          soundManager.playJoin();
          addToast('Connected as Host.', 'info');
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
        addToast('Request sent to host.', 'info');
      } else if (data.status === 'approved' && data.token) {
        setToken(data.token);
        setInGreenRoom(false);
        setStatus('idle');
        soundManager.playJoin();
        addToast('Connected to room.', 'info');
      }
    } catch (err) {
      console.error('Failed to join room:', err);
      addToast('Could not connect. Check backend server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ACTION: Confirm Leave Call
  const handleConfirmLeave = () => {
    soundManager.playLeave();
    if (activeRoomName && token) {
      setRejoinRoom({ roomName: activeRoomName, token });
    }
    setShowLeaveModal(false);
    setToken(null);
    setIsHost(false);
    setInGreenRoom(false);
    setStatus('idle');
    setActiveSidebar(null);
    setMessages([]);
    setHandRaisedUsers([]);
    setIsLocalHandRaised(false);
    window.history.pushState({}, '', '/');
    addToast('You have left the meeting.', 'info');
  };

  // ACTION: Host End Call for Everyone
  const handleEndCallForEveryone = async () => {
    if (!activeRoomName) return;
    try {
      if (roomInstanceRef.current) {
        const payload = JSON.stringify({ action: 'end_room' });
        await roomInstanceRef.current.localParticipant.publishData(new TextEncoder().encode(payload), { reliable: true });
      }

      await fetch(`${BACKEND_URL}/api/end-room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: activeRoomName }),
      });
    } catch (e) {
      console.error('Failed to end room session:', e);
    }
    handleConfirmLeave();
  };

  // ACTION: Moderate Knocking Guest
  const handleModerateGuest = async (targetGuest: string, action: 'approve' | 'deny') => {
    try {
      await fetch(`${BACKEND_URL}/api/moderate-guest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: activeRoomName, participantName: targetGuest, action }),
      });

      setPendingGuests((prev) => prev.filter((p) => p.participantName !== targetGuest));
      addToast(action === 'approve' ? `Admitted ${targetGuest}` : `Denied ${targetGuest}`, action === 'approve' ? 'success' : 'info');
    } catch (err) {
      console.error('Failed to moderate guest:', err);
    }
  };

  // ACTION: Send In-Call Message
  const handleSendChatMessage = (text: string) => {
    const newMsg: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      sender: participantName,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: true,
    };

    setMessages((prev) => [...prev, newMsg]);

    if (roomInstanceRef.current) {
      try {
        const payload = JSON.stringify({
          type: 'chat',
          id: newMsg.id,
          sender: participantName,
          text,
          timestamp: newMsg.timestamp,
        });
        roomInstanceRef.current.localParticipant.publishData(new TextEncoder().encode(payload), { reliable: true });
      } catch (e) {
        console.error('Failed to send chat data:', e);
      }
    }
  };

  // ACTION: Trigger Emoji Reaction
  const handleTriggerReaction = (emoji: string) => {
    const newReaction: FloatingReaction = {
      id: Math.random().toString(36).substring(2, 9),
      emoji,
      sender: participantName,
      xPos: Math.floor(Math.random() * 60) + 20,
      createdAt: Date.now(),
    };
    setReactions((prev) => [...prev, newReaction]);

    if (roomInstanceRef.current) {
      try {
        const payload = JSON.stringify({
          type: 'reaction',
          emoji,
          sender: participantName,
        });
        roomInstanceRef.current.localParticipant.publishData(new TextEncoder().encode(payload), { reliable: false });
      } catch (e) {
        console.error('Failed to broadcast reaction:', e);
      }
    }
  };

  // ACTION: Toggle Hand Raise
  const handleToggleHandRaise = () => {
    const nextState = !isLocalHandRaised;
    setIsLocalHandRaised(nextState);

    if (nextState) {
      soundManager.playHandRaise();
      setHandRaisedUsers((prev) => (prev.includes(participantName) ? prev : [...prev, participantName]));
      addToast('You raised your hand.', 'info');
    } else {
      setHandRaisedUsers((prev) => prev.filter((u) => u !== participantName));
    }

    if (roomInstanceRef.current) {
      try {
        const payload = JSON.stringify({
          type: 'hand_raise',
          identity: participantName,
          isRaised: nextState,
        });
        roomInstanceRef.current.localParticipant.publishData(new TextEncoder().encode(payload), { reliable: true });
      } catch (e) {
        console.error('Failed to broadcast hand raise:', e);
      }
    }
  };

  return (
    <div className="relative min-h-[100dvh] w-full bg-white text-[#202124] font-sans overflow-x-hidden">
      {/* Custom Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* VIEW 0: ABOUT / WALKTHROUGH & CREATOR PAGE */}
      {showAboutPage && (
        <AboutPage
          onBack={() => {
            setShowAboutPage(false);
            if (window.location.pathname === '/about') {
              window.history.pushState({}, '', '/');
            }
          }}
        />
      )}

      {/* VIEW 1: MEET STUDIO LANDING PAGE */}
      {!showAboutPage && !inGreenRoom && !token && (
        <div className="relative min-h-[100dvh] w-full bg-white">
          <MeetLanding
            roomInput={roomInput}
            setRoomInput={setRoomInput}
            participantName={participantName}
            setParticipantName={setParticipantName}
            onStartInstantMeeting={handleStartInstantMeeting}
            onCreateLinkForLater={handleCreateLinkForLater}
            onJoinWithCode={handleJoinWithCode}
            onOpenAbout={() => {
              setShowAboutPage(true);
              window.history.pushState({}, '', '/about');
            }}
            loading={loading}
            status={status}
          />

          {/* Rejoin Call Pill */}
          {rejoinRoom && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white border border-[#dadce0] p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 max-w-sm w-[calc(100vw-2rem)] animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-bold text-[#202124] truncate">Left #{rejoinRoom.roomName}</p>
                <p className="text-[11px] text-[#5f6368]">Click rejoin to re-enter meeting</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setToken(rejoinRoom.token);
                    setActiveRoomName(rejoinRoom.roomName);
                    setRejoinRoom(null);
                    soundManager.playJoin();
                    addToast('Rejoined meeting.', 'success');
                  }}
                  className="flex items-center gap-1.5 bg-[#1a73e8] hover:bg-[#1b66ca] text-white font-bold px-3.5 py-2 rounded-xl text-xs active:scale-95 transition-all shadow-xs cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Rejoin
                </button>

                <button
                  type="button"
                  onClick={() => setRejoinRoom(null)}
                  className="p-1.5 text-[#5f6368] hover:text-[#202124] rounded-lg cursor-pointer hover:bg-[#f1f3f4]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: GREEN ROOM PRE-JOIN */}
      {!showAboutPage && inGreenRoom && !token && (
        <GreenRoomPreview
          roomName={activeRoomName || ''}
          participantName={participantName}
          setParticipantName={setParticipantName}
          isHost={isHost}
          onJoin={handleGreenRoomJoin}
          loading={loading}
          status={status}
        />
      )}

      {/* VIEW 3: LIVE MEET STUDIO CALL CANVAS */}
      {!showAboutPage && token && (
        <div className="flex flex-col h-[100dvh] w-screen bg-[#f8f9fa] overflow-hidden relative select-none">
          <LiveKitRoom
            video={true}
            audio={true}
            token={token}
            serverUrl={LIVEKIT_URL}
            data-lk-theme="default"
            onDisconnected={() => setShowLeaveModal(true)}
            style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <RoomContextBinder onRoomReady={(room) => { roomInstanceRef.current = room; }} />

            {/* Live DataChannel Event Listeners */}
            <HostDataListener
              onKicked={() => addToast('You were removed by the host.', 'error')}
              onRoomEnded={() => addToast('The host has ended the meeting for everyone.', 'warning')}
              onReceiveReaction={(reaction) => setReactions((prev) => [...prev, reaction])}
              onReceiveChatMessage={(msg) => {
                setMessages((prev) => [...prev, msg]);
                if (activeSidebar !== 'chat') {
                  setUnreadMessages((prev) => prev + 1);
                }
              }}
              onReceiveHandRaise={(identity, isRaised) => {
                if (isRaised) {
                  setHandRaisedUsers((prev) => (prev.includes(identity) ? prev : [...prev, identity]));
                  addToast(`${identity} raised their hand.`, 'info');
                } else {
                  setHandRaisedUsers((prev) => prev.filter((u) => u !== identity));
                }
              }}
              onReceiveDrawEvent={(data) => setExternalDrawData(data)}
            />

            {/* Knocking Approval Banner for Host */}
            {isHost && (
              <HostApprovalBanner
                pendingGuests={pendingGuests}
                onApprove={(guest) => handleModerateGuest(guest, 'approve')}
                onDeny={(guest) => handleModerateGuest(guest, 'deny')}
              />
            )}

            {/* Floating Emoji Reactions Overlay */}
            <EmojiReactionsOverlay reactions={reactions} />

            {/* Closed Captions Live Bar */}
            <CaptionsOverlay isEnabled={captionsEnabled} activeSpeakerName={participantName} />

            {/* Dynamic Responsive Video Stage */}
            <main className="flex-1 relative w-full h-[calc(100dvh-4.5rem)] sm:h-[calc(100dvh-5rem)] overflow-hidden flex bg-[#f8f9fa]">
              <div className="flex-1 h-full overflow-hidden">
                <MeetingStage handRaisedUsers={handRaisedUsers} />
              </div>

              {/* SIDEBARS */}
              <MeetingDetailsDrawer
                isOpen={activeSidebar === 'details'}
                onClose={() => setActiveSidebar(null)}
                roomName={activeRoomName || ''}
                participantName={participantName}
              />

              <PeopleDrawer
                isOpen={activeSidebar === 'people'}
                onClose={() => setActiveSidebar(null)}
                isHost={isHost}
                pendingGuests={pendingGuests}
                onApproveGuest={(guest) => handleModerateGuest(guest, 'approve')}
                onDenyGuest={(guest) => handleModerateGuest(guest, 'deny')}
                handRaisedUsers={handRaisedUsers}
              />

              <InCallChatDrawer
                isOpen={activeSidebar === 'chat'}
                onClose={() => setActiveSidebar(null)}
                messages={messages}
                onSendMessage={handleSendChatMessage}
                isHost={isHost}
                chatEnabled={chatEnabled}
                onToggleChatEnabled={(enabled) => setChatEnabled(enabled)}
              />

              <ActivitiesDrawer
                isOpen={activeSidebar === 'activities'}
                onClose={() => setActiveSidebar(null)}
                externalDrawEvent={externalDrawData}
              />

              {isHost && (
                <HostControlsDrawer
                  isOpen={activeSidebar === 'host'}
                  onClose={() => setActiveSidebar(null)}
                  chatEnabled={chatEnabled}
                  onToggleChatEnabled={(enabled) => setChatEnabled(enabled)}
                />
              )}
            </main>

            {/* Bottom Control Bar */}
            <MeetingControlBar
              roomName={activeRoomName || ''}
              isHost={isHost}
              onLeave={() => setShowLeaveModal(true)}
              onTriggerReaction={handleTriggerReaction}
              isHandRaised={isLocalHandRaised}
              onToggleHandRaise={handleToggleHandRaise}
              captionsEnabled={captionsEnabled}
              onToggleCaptions={() => setCaptionsEnabled(!captionsEnabled)}
              participantCount={1}
              unreadMessagesCount={unreadMessages}
              activeSidebar={activeSidebar}
              onToggleSidebar={(tab) =>
                setActiveSidebar((prev) => (prev === tab ? null : tab))
              }
              onOpenSettings={() => setShowSettingsModal(true)}
              onOpenWhiteboard={() => setActiveSidebar('activities')}
              onOpenAbout={() => {
                setShowAboutPage(true);
              }}
            />

            {/* Modals */}
            <LeaveConfirmModal
              isOpen={showLeaveModal}
              isHost={isHost}
              onCancel={() => setShowLeaveModal(false)}
              onConfirm={handleConfirmLeave}
              onEndCallForEveryone={isHost ? handleEndCallForEveryone : undefined}
            />

            <SettingsModal
              isOpen={showSettingsModal}
              onClose={() => setShowSettingsModal(false)}
            />
          </LiveKitRoom>
        </div>
      )}
    </div>
  );
}