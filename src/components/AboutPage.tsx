import React from 'react';
import {
  Video,
  ArrowLeft,
  Sparkles,
  Shield,
  Zap,
  Globe,
  PenTool,
  Lock,
  Layers,
  Code2,
  Server,
  Mail,
  ExternalLink,
  MessageSquare,
  BarChart2,
  Smile,
  Subtitles,
  Heart,
} from 'lucide-react';

interface AboutPageProps {
  onBack: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-[100dvh] w-full bg-[#ffffff] text-[#202124] font-sans selection:bg-[#1a73e8] selection:text-white flex flex-col justify-between select-none relative overflow-x-hidden">
      {/* Background Gradient Header */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-[#f8f9fa] via-[#e8f0fe]/30 to-transparent pointer-events-none" />

      {/* TOP HEADER */}
      <header className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-4 flex items-center justify-between z-10 border-b border-[#f1f3f4]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#1a73e8] rounded-2xl shadow-md shadow-[#1a73e8]/20 flex items-center justify-center text-white">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-[#202124]">Meet Studio</span>
            <span className="text-xs text-[#5f6368] block sm:inline sm:ml-2">About & Vision</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 bg-[#f1f3f4] hover:bg-[#e8eaed] text-[#1a73e8] font-bold px-4 py-2 rounded-xl text-xs transition-all active:scale-95 cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Meetings</span>
        </button>
      </header>

      {/* MAIN CONTENT CONTAINER */}
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 z-10 space-y-12 sm:space-y-16 my-auto">
        {/* HERO SECTION */}
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e8f0fe] border border-[#d2e3fc] text-[#1967d2] text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#f29900]" />
            <span>The Story Behind Meet Studio</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#202124] leading-tight">
            Engineered for seamless, zero-friction video collaboration.
          </h1>
          <p className="text-sm sm:text-lg text-[#5f6368] leading-relaxed">
            Meet Studio was born from a fundamental idea: video conferencing should be instant, crystal-clear, privacy-first, and completely accessible without paywalls, sign-up barriers, or restrictive meeting time limits.
          </p>
        </section>

        {/* MOTIVE & VISION SECTION */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#f8f9fa] border border-[#dadce0] p-6 rounded-3xl space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shadow-inner">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#202124]">Zero-Friction Access</h3>
            <p className="text-xs sm:text-sm text-[#5f6368] leading-relaxed">
              No mandatory accounts, cumbersome installs, or 40-minute kickoffs. Generate a secure meeting link and start collaborating within seconds.
            </p>
          </div>

          <div className="bg-[#f8f9fa] border border-[#dadce0] p-6 rounded-3xl space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#e6f4ea] text-[#188038] flex items-center justify-center shadow-inner">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#202124]">Privacy & Host Knocking</h3>
            <p className="text-xs sm:text-sm text-[#5f6368] leading-relaxed">
              Equipped with end-to-end encrypted WebRTC streams and a built-in waiting room knocked approval system, giving hosts absolute control over call entry.
            </p>
          </div>

          <div className="bg-[#f8f9fa] border border-[#dadce0] p-6 rounded-3xl space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#fef7e0] text-[#f29900] flex items-center justify-center shadow-inner">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#202124]">Ultra-Low Latency SFU</h3>
            <p className="text-xs sm:text-sm text-[#5f6368] leading-relaxed">
              Powered by LiveKit Cloud WebRTC Selective Forwarding Units (SFU), dynamically optimizing bitrates, audio packet routing, and video grids worldwide.
            </p>
          </div>
        </section>

        {/* ARCHITECTURE & TECH STACK SECTION */}
        <section className="bg-white border border-[#dadce0] rounded-3xl p-6 sm:p-10 space-y-8 shadow-xl">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#202124] tracking-tight flex items-center gap-2">
              <Layers className="w-7 h-7 text-[#1a73e8]" />
              <span>Full-Stack Architecture</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#5f6368]">
              High-performance, modern infrastructure designed for scale, resilience, and real-time synchronization.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-[#f8f9fa] border border-[#dadce0] rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-[#1a73e8] font-bold text-xs">
                <Code2 className="w-4 h-4" /> Frontend
              </div>
              <p className="text-xs font-semibold text-[#202124]">React 19 + TypeScript + Vite</p>
              <p className="text-[11px] text-[#5f6368]">Tailwind CSS, Material 3 Light Mode styling, Google Sans typography.</p>
            </div>

            <div className="p-4 bg-[#f8f9fa] border border-[#dadce0] rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-[#188038] font-bold text-xs">
                <Server className="w-4 h-4" /> Backend API
              </div>
              <p className="text-xs font-semibold text-[#202124]">Node.js + Express REST</p>
              <p className="text-[11px] text-[#5f6368]">JWT token minting, knocking queue store, host moderation endpoints.</p>
            </div>

            <div className="p-4 bg-[#f8f9fa] border border-[#dadce0] rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-[#a142f4] font-bold text-xs">
                <Globe className="w-4 h-4" /> Real-Time WebRTC
              </div>
              <p className="text-xs font-semibold text-[#202124]">LiveKit Cloud SFU</p>
              <p className="text-[11px] text-[#5f6368]">Simulcast video, audio publishing, and reliable DataChannel broadcasts.</p>
            </div>

            <div className="p-4 bg-[#f8f9fa] border border-[#dadce0] rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-[#f29900] font-bold text-xs">
                <Zap className="w-4 h-4" /> Audio Synthesis
              </div>
              <p className="text-xs font-semibold text-[#202124]">Web Audio API Engine</p>
              <p className="text-[11px] text-[#5f6368]">Zero-asset harmonic chimes for joining, leaving, knocking, and chat.</p>
            </div>
          </div>
        </section>

        {/* CORE FEATURES BREAKDOWN */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#202124] tracking-tight">
              Interactive Features Built In
            </h2>
            <p className="text-xs sm:text-sm text-[#5f6368]">
              Everything you need for productive meetings and collaborative workshops.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-[#f8f9fa] border border-[#dadce0] rounded-2xl flex items-start gap-3">
              <div className="p-2 bg-[#e8f0fe] rounded-xl text-[#1a73e8] shrink-0">
                <PenTool className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#202124]">Jamboard Whiteboard</h4>
                <p className="text-[11px] text-[#5f6368] mt-0.5">Real-time collaborative drawing canvas with pen, eraser, and PNG export.</p>
              </div>
            </div>

            <div className="p-4 bg-[#f8f9fa] border border-[#dadce0] rounded-2xl flex items-start gap-3">
              <div className="p-2 bg-[#e6f4ea] rounded-xl text-[#188038] shrink-0">
                <BarChart2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#202124]">Interactive Polls</h4>
                <p className="text-[11px] text-[#5f6368] mt-0.5">Create instant multiple choice polls and watch live voting percentages.</p>
              </div>
            </div>

            <div className="p-4 bg-[#f8f9fa] border border-[#dadce0] rounded-2xl flex items-start gap-3">
              <div className="p-2 bg-[#fef7e0] rounded-xl text-[#f29900] shrink-0">
                <Smile className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#202124]">Emoji Reactions</h4>
                <p className="text-[11px] text-[#5f6368] mt-0.5">Floating emoji particles that rise up across all participants' screens.</p>
              </div>
            </div>

            <div className="p-4 bg-[#f8f9fa] border border-[#dadce0] rounded-2xl flex items-start gap-3">
              <div className="p-2 bg-[#f3e8fd] rounded-xl text-[#a142f4] shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#202124]">In-Call Real-Time Chat</h4>
                <p className="text-[11px] text-[#5f6368] mt-0.5">Ephemeral messaging over DataChannel with unread badge counter.</p>
              </div>
            </div>

            <div className="p-4 bg-[#f8f9fa] border border-[#dadce0] rounded-2xl flex items-start gap-3">
              <div className="p-2 bg-[#e8f0fe] rounded-xl text-[#1a73e8] shrink-0">
                <Subtitles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#202124]">Live Closed Captions</h4>
                <p className="text-[11px] text-[#5f6368] mt-0.5">Real-time speech-to-text transcript bar with active speaker identification.</p>
              </div>
            </div>

            <div className="p-4 bg-[#f8f9fa] border border-[#dadce0] rounded-2xl flex items-start gap-3">
              <div className="p-2 bg-[#fce8e6] rounded-xl text-[#c5221f] shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-[#202124]">Host Controls & Moderation</h4>
                <p className="text-[11px] text-[#5f6368] mt-0.5">Knock approval, Mute all, remote mute, user kick, and End Call for everyone.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CREATOR & CONTACTS SECTION */}
        <section className="bg-gradient-to-br from-[#f8f9fa] to-[#e8f0fe]/40 border border-[#dadce0] rounded-3xl p-6 sm:p-10 space-y-6 shadow-xl text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#1a73e8] to-[#188038] p-1 shadow-lg shrink-0">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-3xl font-extrabold text-[#1a73e8]">
                GS
              </div>
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h3 className="text-2xl font-extrabold text-[#202124]">Govind Sharma</h3>
                <span className="text-xs bg-[#e8f0fe] text-[#1967d2] font-bold px-2.5 py-0.5 rounded-full border border-[#d2e3fc]">
                  Creator & Full-Stack Engineer
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#5f6368] leading-relaxed">
                Passionate about architecting high-performance real-time applications, low-latency WebRTC media pipelines, and scalable cloud systems.
              </p>
            </div>
          </div>

          {/* Social / Contact Links */}
          <div className="pt-4 border-t border-[#dadce0] flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <a
              href="https://github.com/GovindxSharma"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white hover:bg-[#f1f3f4] text-[#202124] border border-[#dadce0] px-4 py-2.5 rounded-2xl text-xs font-bold transition-all active:scale-95 shadow-2xs"
            >
              <svg className="w-4 h-4 fill-current text-[#202124]" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub: @GovindxSharma</span>
              <ExternalLink className="w-3 h-3 text-[#80868b]" />
            </a>

            <a
              href="mailto:contact@meetstudio.dev"
              className="flex items-center gap-2 bg-[#e8f0fe] hover:bg-[#d2e3fc] text-[#1967d2] border border-[#d2e3fc] px-4 py-2.5 rounded-2xl text-xs font-bold transition-all active:scale-95 shadow-2xs"
            >
              <Mail className="w-4 h-4" />
              <span>Get in Touch</span>
            </a>

            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-2 bg-[#1a73e8] hover:bg-[#1b66ca] text-white px-5 py-2.5 rounded-2xl text-xs font-bold shadow-md shadow-[#1a73e8]/20 transition-all active:scale-95 cursor-pointer ml-auto"
            >
              <span>Start Meeting Now</span>
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 text-center text-xs text-[#5f6368] border-t border-[#f1f3f4] flex flex-col sm:flex-row items-center justify-between gap-2 z-10">
        <p>Meet Studio • Crafted with <Heart className="w-3.5 h-3.5 inline text-rose-500 fill-rose-500" /> by Govind Sharma</p>
        <p className="text-[11px] text-[#80868b]">All rights reserved © 2026</p>
      </footer>
    </div>
  );
};
