import React, { useState, useRef, useEffect } from 'react';
import { X, PenTool, Eraser, Trash2, Download, BarChart2, Plus } from 'lucide-react';
import { useRoomContext } from '@livekit/components-react';

interface ActivitiesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  externalDrawEvent?: any;
}

interface Poll {
  id: string;
  question: string;
  options: { text: string; votes: number }[];
  votedOption?: number;
}

export const ActivitiesDrawer: React.FC<ActivitiesDrawerProps> = ({
  isOpen,
  onClose,
  externalDrawEvent,
}) => {
  const [activeActivity, setActiveActivity] = useState<'menu' | 'whiteboard' | 'polls'>('menu');
  const room = useRoomContext();

  // Whiteboard State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#8ab4f8');
  const [brushSize, setBrushSize] = useState(3);
  const [isEraser, setIsEraser] = useState(false);

  // Polls State
  const [polls, setPolls] = useState<Poll[]>([
    {
      id: '1',
      question: 'How is the audio & video quality for everyone?',
      options: [
        { text: 'Crystal clear (100%)', votes: 3 },
        { text: 'Good quality', votes: 1 },
        { text: 'A bit choppy', votes: 0 },
      ],
    },
  ]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newOptions, setNewOptions] = useState(['', '']);

  // Handle external live draw broadcast
  useEffect(() => {
    if (!externalDrawEvent || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { prevX, prevY, x, y, drawColor, drawSize, erase } = externalDrawEvent;
    ctx.strokeStyle = erase ? '#131314' : drawColor;
    ctx.lineWidth = drawSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(prevX * canvas.width, prevY * canvas.height);
    ctx.lineTo(x * canvas.width, y * canvas.height);
    ctx.stroke();
  }, [externalDrawEvent]);

  if (!isOpen) return null;

  // Whiteboard drawing handlers
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;
    lastPos.current = { x, y };
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPos.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.strokeStyle = isEraser ? '#131314' : color;
    ctx.lineWidth = isEraser ? brushSize * 3 : brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(x, y);
    ctx.stroke();

    // Broadcast stroke to participants via LiveKit DataChannel
    if (room) {
      try {
        const payload = JSON.stringify({
          type: 'wb_draw',
          prevX: lastPos.current.x / canvas.width,
          prevY: lastPos.current.y / canvas.height,
          x: x / canvas.width,
          y: y / canvas.height,
          drawColor: color,
          drawSize: isEraser ? brushSize * 3 : brushSize,
          erase: isEraser,
        });
        room.localParticipant.publishData(new TextEncoder().encode(payload), { reliable: false });
      } catch (err) {
        // ignore
      }
    }

    lastPos.current = { x, y };
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPos.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#131314';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const downloadDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'meet-whiteboard.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Poll handlers
  const handleVote = (pollId: string, optIndex: number) => {
    setPolls((prev) =>
      prev.map((p) => {
        if (p.id !== pollId || p.votedOption !== undefined) return p;
        const newOpts = [...p.options];
        newOpts[optIndex] = { ...newOpts[optIndex], votes: newOpts[optIndex].votes + 1 };
        return { ...p, options: newOpts, votedOption: optIndex };
      })
    );
  };

  const handleCreatePoll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || newOptions.some((o) => !o.trim())) return;
    const poll: Poll = {
      id: Date.now().toString(),
      question: newQuestion.trim(),
      options: newOptions.map((text) => ({ text: text.trim(), votes: 0 })),
    };
    setPolls((prev) => [poll, ...prev]);
    setNewQuestion('');
    setNewOptions(['', '']);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-96 bg-[#202124] border-l border-[#3c4043] shadow-2xl flex flex-col font-sans select-none animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#3c4043]">
        <div className="flex items-center gap-2">
          {activeActivity !== 'menu' && (
            <button
              type="button"
              onClick={() => setActiveActivity('menu')}
              className="text-xs text-[#8ab4f8] hover:underline mr-1 cursor-pointer"
            >
              ← Back
            </button>
          )}
          <h3 className="text-base font-bold text-white tracking-tight">
            {activeActivity === 'menu'
              ? 'Activities'
              : activeActivity === 'whiteboard'
              ? 'Collaborative Whiteboard'
              : 'Polls & Q&A'}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-[#303134] transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* View 1: Main Activities Hub */}
      {activeActivity === 'menu' && (
        <div className="p-4 space-y-3 flex-1 overflow-y-auto">
          <button
            type="button"
            onClick={() => setActiveActivity('whiteboard')}
            className="w-full flex items-start gap-4 p-4 bg-[#171717] hover:bg-[#2d2e30] border border-[#3c4043] rounded-2xl text-left transition-all cursor-pointer group"
          >
            <div className="p-3 bg-[#1a73e8]/20 border border-[#8ab4f8]/30 rounded-xl text-[#8ab4f8] group-hover:scale-105 transition-transform">
              <PenTool className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Whiteboarding (Jamboard)</h4>
              <p className="text-xs text-slate-400 mt-1 leading-snug">
                Sketch, brainstorm, and collaborate live with everyone in the meeting.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setActiveActivity('polls')}
            className="w-full flex items-start gap-4 p-4 bg-[#171717] hover:bg-[#2d2e30] border border-[#3c4043] rounded-2xl text-left transition-all cursor-pointer group"
          >
            <div className="p-3 bg-emerald-500/20 border border-emerald-400/30 rounded-xl text-emerald-400 group-hover:scale-105 transition-transform">
              <BarChart2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Polls & Quick Q&A</h4>
              <p className="text-xs text-slate-400 mt-1 leading-snug">
                Ask questions and collect live votes from your meeting participants.
              </p>
            </div>
          </button>
        </div>
      )}

      {/* View 2: Collaborative Whiteboard */}
      {activeActivity === 'whiteboard' && (
        <div className="flex-1 flex flex-col p-3 space-y-3 overflow-hidden">
          {/* Tools Bar */}
          <div className="flex items-center justify-between bg-[#171717] p-2 rounded-xl border border-[#3c4043] flex-wrap gap-1">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsEraser(false)}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  !isEraser ? 'bg-[#1a73e8] text-white' : 'text-slate-400 hover:bg-[#303134]'
                }`}
                title="Pen"
              >
                <PenTool className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsEraser(true)}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  isEraser ? 'bg-[#1a73e8] text-white' : 'text-slate-400 hover:bg-[#303134]'
                }`}
                title="Eraser"
              >
                <Eraser className="w-4 h-4" />
              </button>

              {/* Stroke Size Selector */}
              <select
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="bg-[#202124] text-xs text-slate-200 border border-[#3c4043] rounded-lg px-2 py-1 outline-none cursor-pointer"
                title="Stroke Width"
              >
                <option value={2}>Thin</option>
                <option value={4}>Medium</option>
                <option value={8}>Thick</option>
              </select>

              {/* Color dots */}
              <div className="flex items-center gap-1 ml-1">
                {['#8ab4f8', '#f28b82', '#81c995', '#fdd663', '#ffffff'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setColor(c);
                      setIsEraser(false);
                    }}
                    style={{ backgroundColor: c }}
                    className={`w-5 h-5 rounded-full border transition-transform cursor-pointer ${
                      color === c && !isEraser ? 'scale-125 border-white shadow-md' : 'border-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={clearCanvas}
                className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                title="Clear Board"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={downloadDrawing}
                className="p-2 text-[#8ab4f8] hover:bg-[#8ab4f8]/10 rounded-lg transition-colors cursor-pointer"
                title="Download Drawing"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Canvas Box */}
          <div className="flex-1 bg-[#131314] border border-[#3c4043] rounded-2xl overflow-hidden relative touch-none">
            <canvas
              ref={canvasRef}
              width={350}
              height={420}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-full cursor-crosshair"
            />
          </div>
        </div>
      )}

      {/* View 3: Polls */}
      {activeActivity === 'polls' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Create Poll Box */}
          <form
            onSubmit={handleCreatePoll}
            className="p-3.5 bg-[#171717] border border-[#3c4043] rounded-2xl space-y-3"
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Create a new poll
            </h4>
            <input
              type="text"
              placeholder="Ask a question..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="w-full bg-[#202124] border border-[#3c4043] focus:border-[#8ab4f8] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
            />
            <div className="space-y-1.5">
              {newOptions.map((opt, idx) => (
                <input
                  key={idx}
                  type="text"
                  placeholder={`Option ${idx + 1}`}
                  value={opt}
                  onChange={(e) => {
                    const copy = [...newOptions];
                    copy[idx] = e.target.value;
                    setNewOptions(copy);
                  }}
                  className="w-full bg-[#202124] border border-[#3c4043] focus:border-[#8ab4f8] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
                />
              ))}
            </div>
            <button
              type="submit"
              disabled={!newQuestion.trim() || newOptions.some((o) => !o.trim())}
              className="w-full bg-[#1a73e8] hover:bg-[#1b66ca] disabled:opacity-40 text-white font-bold py-2 rounded-xl text-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Launch Poll
            </button>
          </form>

          {/* Active Polls List */}
          <div className="space-y-3">
            {polls.map((poll) => {
              const totalVotes = poll.options.reduce((acc, o) => acc + o.votes, 0);
              return (
                <div
                  key={poll.id}
                  className="bg-[#171717] border border-[#3c4043] p-4 rounded-2xl space-y-3"
                >
                  <h4 className="text-xs sm:text-sm font-bold text-white">{poll.question}</h4>
                  <div className="space-y-2">
                    {poll.options.map((opt, idx) => {
                      const percent = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                      const hasVotedThis = poll.votedOption === idx;

                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={poll.votedOption !== undefined}
                          onClick={() => handleVote(poll.id, idx)}
                          className={`w-full relative overflow-hidden rounded-xl border p-2.5 text-left transition-all text-xs cursor-pointer flex items-center justify-between ${
                            hasVotedThis
                              ? 'border-[#8ab4f8] bg-[#1a73e8]/20 text-white'
                              : 'border-[#3c4043] bg-[#202124] text-slate-300 hover:bg-[#2d2e30]'
                          }`}
                        >
                          {/* Percentage fill bar */}
                          {totalVotes > 0 && (
                            <div
                              className="absolute inset-y-0 left-0 bg-[#8ab4f8]/15 transition-all duration-300"
                              style={{ width: `${percent}%` }}
                            />
                          )}
                          <span className="relative z-10 font-medium truncate flex-1">{opt.text}</span>
                          <span className="relative z-10 text-[11px] font-mono text-slate-400 shrink-0 ml-2">
                            {percent}% ({opt.votes})
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-400 text-right">{totalVotes} votes</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
