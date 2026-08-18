import React from 'react';
import {
  Video,
  ArrowLeft,
  Sparkles,
  Zap,
  Globe,
  Code2,
  Server,
  Mail,
  ExternalLink,
  Heart,
  Lightbulb,
  Target,
  Compass,
  Workflow,
  Cpu,
} from 'lucide-react';

interface AboutPageProps {
  onBack: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-[100dvh] w-full bg-[#ffffff] text-[#202124] font-sans selection:bg-[#1a73e8] selection:text-white flex flex-col justify-between select-none relative overflow-x-hidden">
      {/* Background Subtle Gradient */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-[#f8f9fa] via-[#e8f0fe]/40 to-transparent pointer-events-none" />

      {/* TOP HEADER */}
      <header className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-4 flex items-center justify-between z-10 border-b border-[#f1f3f4]">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 bg-[#1a73e8] rounded-2xl shadow-md shadow-[#1a73e8]/20 flex items-center justify-center text-white">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-[#202124]">Meet Studio</span>
            <span className="text-xs text-[#5f6368] block sm:inline sm:ml-2">Story, Ideation & Workflow</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 bg-[#1a73e8] hover:bg-[#1b66ca] text-white font-bold px-4 py-2 rounded-xl text-xs transition-all active:scale-95 cursor-pointer shadow-md shadow-[#1a73e8]/20"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Meetings</span>
        </button>
      </header>

      {/* MAIN STORY & WORKFLOW CONTENT */}
      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 z-10 space-y-12 sm:space-y-16 my-auto">
        {/* SECTION 1: HERO & VISION */}
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#e8f0fe] border border-[#d2e3fc] text-[#1967d2] text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#f29900]" />
            <span>Meet Studio Vision & Motive</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#202124] leading-tight">
            How Meet Studio Came to Life
          </h1>
          <p className="text-sm sm:text-lg text-[#5f6368] leading-relaxed">
            A look into the inception, architecture, end-to-end workflow, and the engineering principles behind building an unmetered, privacy-first, Google-standard video conferencing studio.
          </p>
        </section>

        {/* SECTION 2: THE IDEATION & MOTIVE (How it came to life) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#f8f9fa] border border-[#dadce0] p-6 rounded-3xl space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shadow-inner">
              <Lightbulb className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#202124]">The Spark & Frustration</h3>
            <p className="text-xs sm:text-sm text-[#5f6368] leading-relaxed">
              Mainstream video calling platforms are burdened by artificial 40-minute meeting cutoffs, intrusive account sign-ups, and bloated desktop software. We set out to build a pure browser-native alternative.
            </p>
          </div>

          <div className="bg-[#f8f9fa] border border-[#dadce0] p-6 rounded-3xl space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#e6f4ea] text-[#188038] flex items-center justify-center shadow-inner">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#202124]">The Core Objective</h3>
            <p className="text-xs sm:text-sm text-[#5f6368] leading-relaxed">
              Create a lightning-fast WebRTC studio where anyone can generate a room code with zero friction, experience authentic Google Meet aesthetics, and collaborate without artificial limitations.
            </p>
          </div>

          <div className="bg-[#f8f9fa] border border-[#dadce0] p-6 rounded-3xl space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#fef7e0] text-[#f29900] flex items-center justify-center shadow-inner">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#202124]">The Philosophy</h3>
            <p className="text-xs sm:text-sm text-[#5f6368] leading-relaxed">
              Zero clutter, clean light-mode minimalism, privacy by design with knocking approval queues, and collaborative tools (Jamboard & Polls) built straight into the call canvas.
            </p>
          </div>
        </section>

        {/* SECTION 3: COMPLETE END-TO-END WORKFLOW DIAGRAM */}
        <section className="bg-white border border-[#dadce0] rounded-3xl p-6 sm:p-10 space-y-8 shadow-xl">
          <div className="space-y-2 text-left">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1a73e8]">
              <Workflow className="w-4 h-4" /> System Workflow
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#202124] tracking-tight">
              How a Meeting Flows in Meet Studio
            </h2>
            <p className="text-xs sm:text-sm text-[#5f6368]">
              Every step from link creation to ultra-low latency WebRTC streaming and host moderation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Step 1 */}
            <div className="bg-[#f8f9fa] border border-[#dadce0] p-5 rounded-2xl space-y-3 relative">
              <div className="w-8 h-8 rounded-full bg-[#1a73e8] text-white flex items-center justify-center text-xs font-bold">
                1
              </div>
              <h4 className="text-sm font-bold text-[#202124]">Room Creation</h4>
              <p className="text-[11px] text-[#5f6368] leading-relaxed">
                Host enters name and generates a unique meeting code (`abc-defg-hij`). Backend signs a secure host JWT token with LiveKit admin permissions.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#f8f9fa] border border-[#dadce0] p-5 rounded-2xl space-y-3 relative">
              <div className="w-8 h-8 rounded-full bg-[#188038] text-white flex items-center justify-center text-xs font-bold">
                2
              </div>
              <h4 className="text-sm font-bold text-[#202124]">Green Room Preview</h4>
              <p className="text-[11px] text-[#5f6368] leading-relaxed">
                Participants test camera framing, mirror toggle, and lighting filters before knocking. No audio bars clutter the feed.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#f8f9fa] border border-[#dadce0] p-5 rounded-2xl space-y-3 relative">
              <div className="w-8 h-8 rounded-full bg-[#f29900] text-white flex items-center justify-center text-xs font-bold">
                3
              </div>
              <h4 className="text-sm font-bold text-[#202124]">Waiting Room Knock</h4>
              <p className="text-[11px] text-[#5f6368] leading-relaxed">
                Guests knock on entry. Host hears a Web Audio chime and can Admit or Deny guests via real-time moderation polling.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-[#f8f9fa] border border-[#dadce0] p-5 rounded-2xl space-y-3 relative">
              <div className="w-8 h-8 rounded-full bg-[#a142f4] text-white flex items-center justify-center text-xs font-bold">
                4
              </div>
              <h4 className="text-sm font-bold text-[#202124]">SFU WebRTC Call</h4>
              <p className="text-[11px] text-[#5f6368] leading-relaxed">
                Connected via LiveKit Cloud SFU with real-time Whiteboard stroke sync, live Polls, DataChannel chat, and emoji bursts.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 4: FULL-STACK TECHNICAL ARCHITECTURE */}
        <section className="bg-[#f8f9fa] border border-[#dadce0] rounded-3xl p-6 sm:p-10 space-y-6 shadow-md">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#202124] tracking-tight flex items-center gap-2">
              <Cpu className="w-7 h-7 text-[#1a73e8]" />
              <span>Full-Stack Technology Stack</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#5f6368]">
              Engineered with modern, reactive, and battle-tested real-time web technologies.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-[#dadce0] rounded-2xl space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 text-[#1a73e8] font-bold text-xs">
                <Code2 className="w-4 h-4" /> Frontend Studio
              </div>
              <p className="text-xs font-semibold text-[#202124]">React 19 + TypeScript + Vite</p>
              <p className="text-[11px] text-[#5f6368]">Tailwind CSS, Google Sans typography, responsive mobile bottom sheets.</p>
            </div>

            <div className="p-4 bg-white border border-[#dadce0] rounded-2xl space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 text-[#188038] font-bold text-xs">
                <Server className="w-4 h-4" /> Backend Infrastructure
              </div>
              <p className="text-xs font-semibold text-[#202124]">Node.js + Express REST</p>
              <p className="text-[11px] text-[#5f6368]">LiveKit Server SDK token issuer, knocking queue, and host endpoints.</p>
            </div>

            <div className="p-4 bg-white border border-[#dadce0] rounded-2xl space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 text-[#a142f4] font-bold text-xs">
                <Globe className="w-4 h-4" /> Global WebRTC Media
              </div>
              <p className="text-xs font-semibold text-[#202124]">LiveKit Cloud SFU</p>
              <p className="text-[11px] text-[#5f6368]">Simulcast HD video, sub-100ms audio delivery, reliable DataChannel events.</p>
            </div>

            <div className="p-4 bg-white border border-[#dadce0] rounded-2xl space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 text-[#f29900] font-bold text-xs">
                <Zap className="w-4 h-4" /> Audio Synthesis
              </div>
              <p className="text-xs font-semibold text-[#202124]">Web Audio API Engine</p>
              <p className="text-[11px] text-[#5f6368]">Pure synthesized harmonic bells for join, leave, knock alert, and chat pop.</p>
            </div>
          </div>
        </section>

        {/* SECTION 5: CREATOR PROFILE & CONTACTS */}
        <section className="bg-gradient-to-br from-[#ffffff] via-[#f8f9fa] to-[#e8f0fe]/50 border border-[#dadce0] rounded-3xl p-6 sm:p-10 space-y-6 shadow-xl text-center sm:text-left">
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
                  Creator & Full-Stack Architect
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#5f6368] leading-relaxed">
                Full-Stack Engineer with a passion for designing resilient real-time distributed applications, low-latency WebRTC media pipelines, and scalable cloud systems.
              </p>
            </div>
          </div>

          {/* Social & Contact Links */}
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
              <span>Launch a Meeting</span>
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
