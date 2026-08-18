import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageSquare, ShieldAlert } from 'lucide-react';

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isSelf: boolean;
}

interface InCallChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isHost: boolean;
  chatEnabled: boolean;
  onToggleChatEnabled?: (enabled: boolean) => void;
}

export const InCallChatDrawer: React.FC<InCallChatDrawerProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  isHost,
  chatEnabled = true,
  onToggleChatEnabled,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    if (!chatEnabled && !isHost) return;

    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-96 bg-white border-l border-[#dadce0] shadow-2xl flex flex-col font-sans select-none animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#dadce0]">
        <div className="flex items-center gap-2.5">
          <MessageSquare className="w-5 h-5 text-[#1a73e8]" />
          <h3 className="text-base font-bold text-[#202124] tracking-tight">In-call messages</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-[#5f6368] hover:text-[#202124] rounded-full hover:bg-[#f1f3f4] transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Host Permissions Banner */}
      {isHost && onToggleChatEnabled && (
        <div className="px-5 py-2.5 bg-[#f8f9fa] border-b border-[#dadce0] flex items-center justify-between">
          <span className="text-xs text-[#3c4043] font-medium">Allow participant messages</span>
          <button
            type="button"
            onClick={() => onToggleChatEnabled(!chatEnabled)}
            className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
              chatEnabled ? 'bg-[#1a73e8]' : 'bg-[#dadce0]'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform transform absolute top-0.5 ${
                chatEnabled ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      )}

      {/* Notice */}
      <div className="px-5 py-2.5 bg-[#f8f9fa] text-[11px] text-[#5f6368] leading-relaxed border-b border-[#dadce0]">
        Messages can be seen only by people in the call and are deleted when the call ends.
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-[#5f6368] p-6 space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#f1f3f4] flex items-center justify-center text-[#5f6368]">
              <MessageSquare className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-[#202124]">No messages yet</p>
            <p className="text-[11px] text-[#5f6368]">Send a message to everyone in the meeting</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.isSelf ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1">
                <span className="text-[11px] font-semibold text-[#3c4043]">
                  {msg.isSelf ? 'You' : msg.sender}
                </span>
                <span className="text-[10px] text-[#80868b]">{msg.timestamp}</span>
              </div>
              <div
                className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed break-words shadow-2xs ${
                  msg.isSelf
                    ? 'bg-[#e8f0fe] text-[#1967d2] font-medium rounded-br-none border border-[#d2e3fc]'
                    : 'bg-[#f1f3f4] text-[#202124] rounded-bl-none border border-[#dadce0]'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-[#dadce0] bg-white">
        {!chatEnabled && !isHost ? (
          <div className="text-xs text-[#c5221f] bg-[#fce8e6] border border-[#fad2cf] p-2.5 rounded-xl text-center flex items-center justify-center gap-1.5 font-medium">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Chat is disabled by the host</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Send a message to everyone..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-[#f8f9fa] border border-[#dadce0] focus:border-[#1a73e8] focus:bg-white focus:ring-1 focus:ring-[#1a73e8] rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-[#202124] placeholder-[#80868b] outline-none transition-all shadow-2xs"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 bg-[#1a73e8] hover:bg-[#1b66ca] disabled:opacity-40 text-white rounded-2xl font-bold transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed shrink-0 shadow-xs flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
