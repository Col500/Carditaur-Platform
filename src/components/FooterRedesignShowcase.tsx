import React, { useState } from 'react';
import { 
  Instagram, 
  Twitter, 
  Linkedin, 
  Sparkles, 
  Maximize2, 
  Layers, 
  CheckCircle2, 
  FileCode, 
  AlertTriangle 
} from 'lucide-react';

export interface LogoPreset {
  id: string;
  name: string;
  type: 'square' | 'wide' | 'circular' | 'padding';
  aspectRatio: string;
  bgColor: string;
  svg: React.ReactNode;
  description: string;
}

export function FooterRedesignShowcase() {
  const [activeLogoId, setActiveLogoId] = useState<string>('wide');
  const [isOpticalAligned, setIsOpticalAligned] = useState<boolean>(true);
  const [customCompanyName, setCustomCompanyName] = useState<string>('Acme Industries');
  const [activeTab, setActiveTab] = useState<'preview' | 'react' | 'tailwind' | 'fallbacks'>('preview');

  // Interactive Logo Presets rendered as inline SVGs to ensure high-quality, zero-network load
  const logoPresets: LogoPreset[] = [
    {
      id: 'square',
      name: 'Square Logo',
      type: 'square',
      aspectRatio: '1:1',
      bgColor: 'bg-emerald-500',
      description: 'Equal width & height (48px x 48px). Fits tightly inside the container box.',
      svg: (
        <svg viewBox="0 0 100 100" className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="12">
          <rect x="15" y="15" width="70" height="70" rx="10" />
          <path d="M40 35 L60 65 M60 35 L40 65" strokeLinecap="round" />
        </svg>
      )
    },
    {
      id: 'wide',
      name: 'Wide Landscape Logo',
      type: 'wide',
      aspectRatio: '3:1',
      bgColor: 'bg-indigo-600',
      description: 'Typical corporate wordmark style. Normalized to fit max-width of 48px without vertical distortion.',
      svg: (
        <svg viewBox="0 0 180 60" className="w-11 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="8">
          <path d="M15 15 L45 45 M30 15 L30 45" strokeLinecap="round" />
          <rect x="65" y="15" width="100" height="30" rx="6" />
          <circle cx="115" cy="30" r="6" fill="currentColor" />
        </svg>
      )
    },
    {
      id: 'circular',
      name: 'Circular Badge',
      type: 'circular',
      aspectRatio: '1:1',
      bgColor: 'bg-rose-500',
      description: 'Circular symbol. Stays centered with clean bounding dimensions.',
      svg: (
        <svg viewBox="0 0 100 100" className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="10">
          <circle cx="50" cy="50" r="35" />
          <circle cx="50" cy="50" r="12" fill="currentColor" />
        </svg>
      )
    },
    {
      id: 'padding',
      name: 'Logo with Bad Padding',
      type: 'padding',
      aspectRatio: '1:1 with 20% empty spacing',
      bgColor: 'bg-amber-500/10 border border-dashed border-amber-300',
      description: 'A classic "bad logo" with massive transparent whitespace built into the image asset itself.',
      svg: (
        <div className="w-full h-full p-2 flex items-center justify-center bg-amber-500/10 rounded">
          <svg viewBox="0 0 100 100" className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" strokeWidth="14">
            <path d="M50 15 L85 80 L15 80 Z" strokeLinejoin="round" />
          </svg>
        </div>
      )
    }
  ];

  const currentPreset = logoPresets.find(p => p.id === activeLogoId) || logoPresets[0];

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
      {/* Header & Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase bg-[#39FF14]/15 text-charcoal border border-[#39FF14]/30">
              Alignment Engine V2
            </span>
            <span className="text-[10px] font-mono text-gray-400">100% Responsive & WCAG Compliant</span>
          </div>
          <h3 className="font-display font-black text-xl text-charcoal">
            The Golden Ratio Footer Redesign
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Ensuring absolute optical alignment between different business logos, name typography, and social links.
          </p>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsOpticalAligned(!isOpticalAligned)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
              isOpticalAligned 
                ? 'bg-charcoal text-[#39FF14]' 
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isOpticalAligned ? 'Optical Alignment [ON]' : 'Optical Alignment [OFF]'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 overflow-x-auto gap-2 text-xs">
        <button
          onClick={() => setActiveTab('preview')}
          className={`pb-3 px-2 font-bold border-b-2 transition-all shrink-0 ${
            activeTab === 'preview' ? 'border-charcoal text-charcoal' : 'border-transparent text-gray-400 hover:text-charcoal'
          }`}
        >
          Interactive Preview
        </button>
        <button
          onClick={() => setActiveTab('react')}
          className={`pb-3 px-2 font-bold border-b-2 transition-all shrink-0 ${
            activeTab === 'react' ? 'border-charcoal text-charcoal' : 'border-transparent text-gray-400 hover:text-charcoal'
          }`}
        >
          React Component
        </button>
        <button
          onClick={() => setActiveTab('tailwind')}
          className={`pb-3 px-2 font-bold border-b-2 transition-all shrink-0 ${
            activeTab === 'tailwind' ? 'border-charcoal text-charcoal' : 'border-transparent text-gray-400 hover:text-charcoal'
          }`}
        >
          Tailwind Classes
        </button>
        <button
          onClick={() => setActiveTab('fallbacks')}
          className={`pb-3 px-2 font-bold border-b-2 transition-all shrink-0 ${
            activeTab === 'fallbacks' ? 'border-charcoal text-charcoal' : 'border-transparent text-gray-400 hover:text-charcoal'
          }`}
        >
          Asset Fallbacks & Heuristics
        </button>
      </div>

      {/* TAB 1: Preview */}
      {activeTab === 'preview' && (
        <div className="space-y-6">
          {/* Preset Selector */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400 font-bold block">
              1. Select a logo type to stress-test the alignment:
            </span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {logoPresets.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => setActiveLogoId(preset.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between h-24 ${
                    activeLogoId === preset.id 
                      ? 'border-charcoal bg-slate-50/50 shadow-sm ring-1 ring-charcoal/5' 
                      : 'border-gray-150 bg-white hover:border-gray-300 hover:bg-slate-50/20'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-[10px] font-mono text-gray-400 font-semibold">{preset.aspectRatio}</span>
                    {activeLogoId === preset.id && <div className="w-1.5 h-1.5 rounded-full bg-charcoal" />}
                  </div>
                  <span className="font-sans font-bold text-[11px] text-charcoal mt-2 block leading-snug">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Preset Explanation */}
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-slate-200/60 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[10px] font-mono font-bold text-slate-600">i</span>
            </div>
            <div className="space-y-0.5">
              <span className="font-sans font-bold text-charcoal text-[11px]">Testing: {currentPreset.name}</span>
              <p className="text-[10px] text-slate-500 leading-relaxed">{currentPreset.description}</p>
            </div>
          </div>

          {/* Core Interactive Sandbox Container */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400 font-bold">
                2. Live Layout Output:
              </span>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={customCompanyName}
                  onChange={(e) => setCustomCompanyName(e.target.value)}
                  placeholder="Change brand name" 
                  className="px-2 py-1 border border-gray-200 rounded-lg text-[10px] font-sans focus:outline-none focus:border-charcoal w-32"
                />
              </div>
            </div>

            {/* Sandbox Container simulating the Flyer boundary */}
            <div className="border border-gray-200 rounded-3xl p-6 bg-slate-900 text-white relative shadow-inner overflow-hidden">
              {/* Reference Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
                <div className="border-t border-dashed border-[#39FF14] w-full" />
                <div className="border-t border-dashed border-[#39FF14] w-full" style={{ top: '50%', transform: 'translateY(-50%)' }} />
                <div className="border-t border-dashed border-[#39FF14] w-full" />
              </div>

              {/* Robust Redesigned Footer System Container */}
              <div 
                id="production-footer"
                className="relative z-10 w-full flex flex-col sm:flex-row justify-between items-center gap-4 py-4 px-5 bg-black/40 backdrop-blur-md rounded-2xl border border-white/5"
              >
                {/* 1. LEFT GROUP: Logo + Company Name */}
                <div className="flex items-center gap-3">
                  {/* Fixed Normalized Logo Container */}
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden shrink-0 border border-white/10 shadow-sm">
                    <div className={`w-10 h-10 ${currentPreset.bgColor} rounded-lg flex items-center justify-center overflow-hidden transition-all duration-300`}>
                      {currentPreset.svg}
                    </div>
                  </div>

                  {/* Company Name */}
                  <span 
                    className="font-sans font-bold text-sm tracking-tight select-all text-white transition-all"
                    style={{ 
                      // Precise optical correction
                      transform: isOpticalAligned ? 'translateY(-0.5px)' : 'none' 
                    }}
                  >
                    {customCompanyName || 'Acme Corp'}
                  </span>
                </div>

                {/* 2. RIGHT GROUP: Social Media Icons + Handles */}
                <div className="flex items-center gap-4 text-xs font-mono font-bold text-gray-300 bg-white/5 py-2 px-4 rounded-xl border border-white/5">
                  {/* Social Handle #1 */}
                  <div className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
                    <div 
                      className="w-4.5 h-4.5 bg-white/10 rounded-md flex items-center justify-center shrink-0 transition-transform"
                      style={{ 
                        transform: isOpticalAligned ? 'translateY(0.5px)' : 'none' 
                      }}
                    >
                      <Instagram className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] tracking-tight">@acme</span>
                  </div>

                  {/* Separator dots */}
                  <span className="text-white/20 select-none">•</span>

                  {/* Social Handle #2 */}
                  <div className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
                    <div 
                      className="w-4.5 h-4.5 bg-white/10 rounded-md flex items-center justify-center shrink-0 transition-transform"
                      style={{ 
                        transform: isOpticalAligned ? 'translateY(0.5px)' : 'none' 
                      }}
                    >
                      <Twitter className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] tracking-tight">@acme_co</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Micro-indicators */}
            <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono px-1">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                No wrapping or overflow under narrow responsive states.
              </span>
              <span>Height: 48px box normalized</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: React Component Code */}
      {activeTab === 'react' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-700 flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-slate-500" />
              Pure React Component (TypeScript)
            </span>
          </div>
          <pre className="p-4 bg-slate-900 rounded-2xl overflow-x-auto text-[10px] font-mono text-slate-200 leading-relaxed shadow-inner">
{`import React from 'react';
import { Instagram, Twitter } from 'lucide-react';

interface FlyerFooterProps {
  logoUrl?: string;
  businessName: string;
  instagram?: string;
  twitter?: string;
  fallbackText?: string;
}

export function FlyerFooter({
  logoUrl,
  businessName,
  instagram = 'acme',
  twitter = 'acme_co',
  fallbackText = 'C'
}: FlyerFooterProps) {
  return (
    <footer style={styles.footerContainer}>
      {/* LEFT GROUP: Brand Assets */}
      <div style={styles.leftGroup}>
        {/* Normalized Image Frame */}
        <div style={styles.logoBox}>
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt="Brand Logo" 
              style={styles.logoImage} 
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Asset fallback: replace broken image with beautiful initial letter circle
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  const initials = document.createElement('div');
                  initials.style.width = '100%';
                  initials.style.height = '100%';
                  initials.style.display = 'flex';
                  initials.style.alignItems = 'center';
                  initials.style.justify = 'center';
                  initials.style.background = 'rgba(255, 255, 255, 0.1)';
                  initials.style.color = '#FFFFFF';
                  initials.style.fontWeight = '900';
                  initials.style.fontSize = '14px';
                  initials.innerText = fallbackText;
                  parent.appendChild(initials);
                }
              }}
            />
          ) : (
            <div style={styles.fallbackCircle}>{fallbackText}</div>
          )}
        </div>

        {/* Vertically optical-aligned business name */}
        <span style={styles.companyName}>
          {businessName}
        </span>
      </div>

      {/* RIGHT GROUP: Social / Contact Assets */}
      <div style={styles.rightGroup}>
        {instagram && (
          <div style={styles.socialItem}>
            <div style={styles.iconWrapper}>
              <Instagram style={styles.icon} />
            </div>
            <span style={styles.handle}>@{instagram}</span>
          </div>
        )}
        
        {instagram && twitter && <span style={styles.separator}>•</span>}

        {twitter && (
          <div style={styles.socialItem}>
            <div style={styles.iconWrapper}>
              <Twitter style={styles.icon} />
            </div>
            <span style={styles.handle}>@{twitter}</span>
          </div>
        )}
      </div>
    </footer>
  );
}

const styles: Record<string, React.CSSProperties> = {
  footerContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: '16px 20px',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: '16px',
    boxSizing: 'border-box'
  },
  leftGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  logoBox: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    boxSizing: 'border-box',
    flexShrink: 0
  },
  logoImage: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain'
  },
  fallbackCircle: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#FFFFFF',
    fontWeight: 900,
    fontSize: '14px'
  },
  companyName: {
    fontFamily: 'sans-serif',
    fontWeight: 'bold',
    fontSize: '14px',
    color: '#FFFFFF',
    transform: 'translateY(-0.5px)' // Optical center correction
  },
  rightGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  socialItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  iconWrapper: {
    width: '18px',
    height: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transform: 'translateY(0.5px)' // Balance icon top-heaviness
  },
  icon: {
    width: '14px',
    height: '14px',
    color: '#D1D5DB'
  },
  handle: {
    fontFamily: 'monospace',
    fontSize: '11px',
    color: '#D1D5DB',
    fontWeight: 'bold'
  },
  separator: {
    color: 'rgba(255,255,255,0.2)',
    userSelect: 'none'
  }
};`}
          </pre>
        </div>
      )}

      {/* TAB 3: Tailwind Version */}
      {activeTab === 'tailwind' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-700">
              Clean Tailwind Utility Classes Representation
            </span>
          </div>
          <pre className="p-4 bg-slate-900 rounded-2xl overflow-x-auto text-[10px] font-mono text-slate-200 leading-relaxed shadow-inner">
{`<div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 py-4 px-5 bg-black/40 rounded-2xl border border-white/5">
  
  {/* LEFT GROUP: Logo & Name */}
  <div className="flex items-center gap-3">
    {/* logo-box: fixed-size normalized container */}
    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden shrink-0">
      <img 
        className="max-w-full max-h-full object-contain" 
        src={logoUrl} 
        alt="Logo" 
      />
    </div>
    
    {/* Company Name with -translate-y-[0.5px] optical adjustment */}
    <span className="font-sans font-bold text-sm tracking-tight text-white -translate-y-[0.5px]">
      {businessName}
    </span>
  </div>

  {/* RIGHT GROUP: Social Handles with gap-4 */}
  <div className="flex items-center gap-4 text-xs font-mono font-bold text-gray-300">
    <div className="flex items-center gap-1.5">
      <div className="w-[18px] h-[18px] flex items-center justify-center translate-y-[0.5px]">
        <Instagram className="w-3.5 h-3.5" />
      </div>
      <span className="text-[10px] tracking-tight">@{instagram}</span>
    </div>

    <span className="text-white/20 select-none">•</span>

    <div className="flex items-center gap-1.5">
      <div className="w-[18px] h-[18px] flex items-center justify-center translate-y-[0.5px]">
        <Twitter className="w-3.5 h-3.5" />
      </div>
      <span className="text-[10px] tracking-tight">@{twitter}</span>
    </div>
  </div>

</div>`}
          </pre>
        </div>
      )}

      {/* TAB 4: Bad Logo Fallbacks */}
      {activeTab === 'fallbacks' && (
        <div className="space-y-4 text-xs">
          <div className="flex items-center gap-2 text-charcoal font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-[11px] uppercase tracking-wider font-mono">Robust Fallback Rules & Heuristics</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-2">
              <h5 className="font-bold text-charcoal">1. Image Crop & Bad Padding</h5>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Some uploaded logo assets contain massive invisible boundaries. 
                Using <code className="bg-white px-1.5 py-0.5 rounded text-[10px] font-mono border text-amber-700">object-contain</code> keeps the original proportions from breaking, and the fixed 48px box shields the rest of the layout from shifting.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-2">
              <h5 className="font-bold text-charcoal">2. SVG Path Re-styling</h5>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                When using vectors/SVGs in headers, enforce <code className="bg-white px-1.5 py-0.5 rounded text-[10px] font-mono border text-amber-700">fill="currentColor"</code> on children shapes. This allows the parent text-color variables or our Contrast Engine overrides to automatically dictate the SVG branding color safely!
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-2">
              <h5 className="font-bold text-charcoal">3. Network Failures & Broken Urls</h5>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Attach an <code className="bg-white px-1.5 py-0.5 rounded text-[10px] font-mono border text-amber-700">onError</code> listener. If a logo fails to fetch, swap it dynamically with a beautifully stylized circle containing the initial letter of the company name.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-2">
              <h5 className="font-bold text-charcoal">4. High Contrast & Overlays</h5>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                On extreme dark or light background overlays, default logo backgrounds are buffered with <code className="bg-white/10 px-1 py-0.5 rounded text-[10px] font-mono border border-white/15">backdrop-blur-md</code>. This creates a soft aesthetic shield ensuring the logo stays clearly visible against arbitrary image backgrounds.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
