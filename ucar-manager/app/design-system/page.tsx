import React from 'react';

// NOTE FOR COPILOT: This file serves as the strict design system reference for the UCAR project.
// Always use these exact hex codes, typography (Inter), and button structures for all generated UI.

export default function DesignSystemReference() {
  return (
    <div className="min-h-screen bg-[#F7F6F3] p-10 font-sans text-[#0D2B3E]">
      {/* Ideally, import the Inter font in your layout.tsx:
        import { Inter } from 'next/font/google';
        const inter = Inter({ subsets: ['latin'] });
      */}
      
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="border-b border-[#1B4F6B]/20 pb-6">
          <h1 className="text-4xl font-bold tracking-tight text-[#1B4F6B]">UCAR Design System</h1>
          <p className="text-[#0D2B3E]/70 mt-2">Reference page for Copilot styling consistency.</p>
        </header>

        {/* --- COLORS --- */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">1. Color Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <ColorCard name="Primary" hex="#1B4F6B" textClass="text-white" />
            <ColorCard name="Secondary" hex="#0D2B3E" textClass="text-white" />
            <ColorCard name="Tertiary" hex="#C9A84C" textClass="text-[#0D2B3E]" />
            <ColorCard name="Neutral" hex="#F7F6F3" textClass="text-[#0D2B3E]" border />
          </div>
        </section>

        {/* --- TYPOGRAPHY --- */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">2. Typography (Inter)</h2>
          <div className="bg-white p-8 rounded-xl shadow-sm space-y-8 border border-gray-100">
            <div>
              <span className="text-sm text-gray-400 font-medium uppercase tracking-wider">Headline</span>
              <h1 className="text-5xl font-bold text-[#0D2B3E] mt-2">Aa - The quick brown fox</h1>
            </div>
            <div>
              <span className="text-sm text-gray-400 font-medium uppercase tracking-wider">Body</span>
              <p className="text-base font-normal text-[#0D2B3E] mt-2">Aa - The quick brown fox jumps over the lazy dog. Used for standard paragraphs and data tables.</p>
            </div>
            <div>
              <span className="text-sm text-gray-400 font-medium uppercase tracking-wider">Label</span>
              <label className="text-sm font-medium text-[#1B4F6B] mt-2 block">Aa - Input Label / Small text</label>
            </div>
          </div>
        </section>

        {/* --- BUTTONS --- */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">3. Buttons & Controls</h2>
          <div className="bg-white p-8 rounded-xl shadow-sm flex flex-wrap gap-6 border border-gray-100 items-center">
            {/* Primary Button */}
            <button className="px-6 py-2.5 bg-[#1B4F6B] text-white font-medium rounded hover:bg-[#153e54] transition-colors">
              Primary
            </button>
            
            {/* Secondary Button */}
            <button className="px-6 py-2.5 bg-[#F7F6F3] text-[#0D2B3E] font-medium rounded hover:bg-[#e8e6df] transition-colors">
              Secondary
            </button>

            {/* Inverted Button */}
            <button className="px-6 py-2.5 bg-[#0D2B3E] text-white font-medium rounded hover:bg-black transition-colors">
              Inverted
            </button>

            {/* Outlined Button */}
            <button className="px-6 py-2.5 border border-[#1B4F6B] text-[#1B4F6B] font-medium rounded hover:bg-[#1B4F6B]/5 transition-colors">
              Outlined
            </button>
            
            {/* Action Icon Button (Label) */}
            <button className="px-4 py-2 bg-[#1B4F6B] text-white font-medium rounded flex items-center gap-2 hover:bg-[#153e54] transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              Label
            </button>
          </div>
        </section>

        {/* --- INPUTS & UI ELEMENTS --- */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">4. Inputs & Navigation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Search Bar matching the design */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
              <div className="relative w-full max-w-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input 
                  type="text" 
                  placeholder="Search" 
                  className="block w-full pl-10 pr-3 py-2.5 bg-[#F7F6F3] border-none rounded-md text-[#0D2B3E] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1B4F6B]"
                />
              </div>
            </div>

            {/* Pill Navigation */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
              <nav className="flex items-center gap-2 bg-[#F7F6F3] p-1.5 rounded-full">
                <button className="p-2.5 bg-[#1B4F6B] text-white rounded-full hover:bg-[#153e54] transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                </button>
                <button className="p-2.5 text-[#0D2B3E] hover:bg-black/5 rounded-full transition-colors">
                   <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </button>
                <button className="p-2.5 text-[#0D2B3E] hover:bg-black/5 rounded-full transition-colors">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </button>
              </nav>
            </div>
            
          </div>
        </section>

      </div>
    </div>
  );
}

// Helper component just for displaying the colors in the style guide
function ColorCard({ name, hex, textClass, border = false }: { name: string, hex: string, textClass: string, border?: boolean }) {
  return (
    <div className={`rounded-xl overflow-hidden shadow-sm flex flex-col h-40 ${border ? 'border border-gray-200' : ''}`} style={{ backgroundColor: hex }}>
      <div className={`p-4 flex justify-between items-start flex-1 font-medium ${textClass}`}>
        <span>{name}</span>
        <span className="opacity-70 text-sm">{hex}</span>
      </div>
      {/* Decorative gradient bar mapping to the image's shade blocks */}
      <div className="h-8 w-full bg-black/10 flex">
         <div className="flex-1 bg-black/40"></div>
         <div className="flex-1 bg-black/30"></div>
         <div className="flex-1 bg-black/20"></div>
         <div className="flex-1 bg-black/10"></div>
         <div className="flex-1 bg-white/10"></div>
         <div className="flex-1 bg-white/20"></div>
         <div className="flex-1 bg-white/30"></div>
         <div className="flex-1 bg-white/50"></div>
      </div>
    </div>
  );
}