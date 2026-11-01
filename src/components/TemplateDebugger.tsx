import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Cpu, Layers, Image as ImageIcon, Sparkles } from 'lucide-react';
import { FooterRedesignShowcase } from './FooterRedesignShowcase';

interface TemplateDebuggerProps {
  isOpen: boolean;
  onClose: () => void;
  flyerData?: any;
  previewPrompt?: string;
  previewVariations?: any[];
  usedModel?: string;
  onRefreshPrompt?: () => void;
  currentIndex?: number;
  totalCount?: number;
  onNext?: () => void;
  onPrev?: () => void;
}

export function TemplateDebugger({ isOpen, onClose, flyerData, previewPrompt, previewVariations, usedModel, onRefreshPrompt, currentIndex, totalCount, onNext, onPrev }: TemplateDebuggerProps) {
  const [activeTab, setActiveTab] = useState<'diagnostics' | 'footer'>('diagnostics');
  const [localIndex, setLocalIndex] = useState(0);

  if (!isOpen) return null;

  const debugInfo = flyerData?.debug || {};
  let geminiPrompt = "N/A";
  let magicPrompt = debugInfo.magicPrompt;

  // Use local index if previewVariations is provided and flyerData is absent
  const hasLocalVariations = !flyerData && previewVariations && previewVariations.length > 0;
  
  if (hasLocalVariations) {
      geminiPrompt = previewVariations[localIndex].ideogramPrompt;
  } else {
      geminiPrompt = previewPrompt || debugInfo.geminiPrompt || "N/A";
  }

  const displayedModel = usedModel || debugInfo.usedModel || 'Gemini System Prompt';
  const ideogramResponse = debugInfo.ideogramResponse || {};
  const templateUsed = debugInfo.templateUsed || { pos: 'N/A', bg: false };

  const handleNext = () => {
    if (hasLocalVariations) {
      setLocalIndex((prev) => (prev + 1) % previewVariations.length);
    } else if (onNext) {
      onNext();
    }
  };

  const handlePrev = () => {
    if (hasLocalVariations) {
      setLocalIndex((prev) => (prev - 1 + previewVariations.length) % previewVariations.length);
    } else if (onPrev) {
      onPrev();
    }
  };

  const displayTotalCount = hasLocalVariations ? previewVariations.length : totalCount;
  const displayCurrentIndex = hasLocalVariations ? localIndex : currentIndex;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="fixed top-4 right-4 z-50 w-80 lg:w-96 bg-white/95 backdrop-blur-xl border border-gray-200/50 shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[90vh]"
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-2 text-charcoal">
          <Cpu className="w-5 h-5 text-[#39FF14]" />
          <h3 className="font-display font-extrabold text-sm uppercase tracking-wider">
            AI Generation Debugger {displayTotalCount !== undefined && displayTotalCount > 1 ? `(${displayCurrentIndex! + 1}/${displayTotalCount})` : ''}
          </h3>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-black">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex border-b border-gray-100 bg-gray-50/50 p-1">
        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
            activeTab === 'diagnostics' ? 'bg-white shadow-sm text-charcoal' : 'text-gray-500 hover:text-charcoal'
          }`}
        >
          Diagnostics
        </button>
      </div>

      <div className="overflow-y-auto flex-1 p-4 custom-scrollbar bg-[#FAFAFA]">
        {activeTab === 'diagnostics' ? (
          <div className="space-y-6">
            
            {displayTotalCount !== undefined && displayTotalCount > 1 && (
              <div className="flex justify-between items-center bg-white border border-slate-100 rounded-xl p-2 shadow-sm">
                <button onClick={handlePrev} className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors">&larr; Prev Flyer</button>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Swipe Prompts</span>
                <button onClick={handleNext} className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors">Next Flyer &rarr;</button>
              </div>
            )}

            {/* SECTION 1: Gemini AI Output */}
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-charcoal font-bold">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span className="text-[11px] uppercase tracking-wider font-mono">{displayedModel}</span>
              </div>
              <div 
                className={`bg-slate-50 p-3 rounded-xl border ${geminiPrompt.includes("Failed") && onRefreshPrompt ? "border-red-200 cursor-pointer hover:bg-red-50" : "border-slate-100"} max-h-48 overflow-y-auto`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (geminiPrompt.includes("Failed") && onRefreshPrompt) {
                    onRefreshPrompt();
                  }
                }}
              >
                 <p className={`font-mono text-[9px] leading-relaxed whitespace-pre-wrap ${geminiPrompt === 'Generating prompt preview...' ? 'text-blue-500 animate-pulse' : 'text-gray-600'}`}>
                    {geminiPrompt}
                 </p>
                 {geminiPrompt.includes("Failed") && onRefreshPrompt && (
                   <div className="mt-3 text-[10px] font-bold uppercase text-red-500 flex items-center gap-1">
                     Tap to refresh
                   </div>
                 )}
              </div>
            </div>

            {/* SECTION 2: Ideogram Generation */}
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-charcoal font-bold">
                <ImageIcon className="w-4 h-4 text-[#39FF14]" />
                <span className="text-[11px] uppercase tracking-wider font-mono">Ideogram 4.0 Default ($0.06)</span>
              </div>
              
              {debugInfo.magicPrompt && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 max-h-48 overflow-y-auto mb-3">
                   <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Magic Prompt:</span>
                   <p className="font-mono text-[9px] text-gray-600 leading-relaxed whitespace-pre-wrap">
                      {debugInfo.magicPrompt}
                   </p>
                </div>
              )}

              <div className="space-y-2">
                 <div className="flex justify-between items-center py-1 border-b border-slate-50">
                    <span className="text-[10px] font-mono text-gray-400 uppercase">Aspect Ratio</span>
                    <span className="text-[10px] font-mono font-bold text-[#1E824C]">{debugInfo.aspectRatio || flyerData?.flyerData?.aspectRatio || '1x1'}</span>
                 </div>
                 <div className="flex justify-between items-center py-1 border-b border-slate-50">
                    <span className="text-[10px] font-mono text-gray-400 uppercase">Format</span>
                    <span className="text-[10px] font-mono font-bold">{debugInfo.formatLabel || flyerData?.flyerData?.formatLabel || 'Square (1:1)'}</span>
                 </div>
                 <div className="flex justify-between items-center py-1 border-b border-slate-50">
                    <span className="text-[10px] font-mono text-gray-400 uppercase">Resolution</span>
                    <span className="text-[10px] font-mono font-bold">{ideogramResponse.resolution || (flyerData?.flyerData?.width ? `${flyerData.flyerData.width}x${flyerData.flyerData.height}` : '1080x1080')}</span>
                 </div>
                 <div className="flex justify-between items-center py-1 border-b border-slate-50">
                    <span className="text-[10px] font-mono text-gray-400 uppercase">Safe</span>
                    <span className="text-[10px] font-mono font-bold text-green-500">{ideogramResponse.is_image_safe !== false ? "YES" : "NO"}</span>
                 </div>
              </div>
            </div>
            
            {/* SECTION 3: Logo Overlay Template */}
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-charcoal font-bold">
                <Layers className="w-4 h-4 text-blue-500" />
                <span className="text-[11px] uppercase tracking-wider font-mono">Logo Compositing</span>
              </div>
              
              <div className="space-y-2">
                 <div className="flex justify-between items-center py-1 border-b border-slate-50">
                    <span className="text-[10px] font-mono text-gray-400 uppercase">Position</span>
                    <span className="text-[10px] font-mono font-bold uppercase">{templateUsed.pos}</span>
                 </div>
                 <div className="flex justify-between items-center py-1 border-b border-slate-50">
                    <span className="text-[10px] font-mono text-gray-400 uppercase">Contrasting Background</span>
                    <span className="text-[10px] font-mono font-bold">{templateUsed.bg ? "ON" : "OFF"}</span>
                 </div>
              </div>
            </div>

          </div>
        ) : (
          <FooterRedesignShowcase />
        )}
      </div>
    </motion.div>
  );
}
