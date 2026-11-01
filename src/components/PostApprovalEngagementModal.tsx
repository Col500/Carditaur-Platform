import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Copy, Download, Share2, MessageCircle, Mail, Instagram, Sparkles, Bell, Calendar } from 'lucide-react';

interface PostApprovalEngagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  flyer: any;
  business: any;
  occasion: any;
  nextOccasion?: { name: string; dateStr: string; daysLeft: number } | null;
}

export const PostApprovalEngagementModal: React.FC<PostApprovalEngagementModalProps> = ({
  isOpen,
  onClose,
  flyer,
  business,
  occasion,
  nextOccasion,
}) => {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'social' | 'email'>('whatsapp');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const occasionName = occasion?.name || 'Special Celebration';
  const bizName = business?.businessName || 'Our Company';
  const phone = business?.phone || '';
  const email = business?.email || '';
  const instagram = business?.instagram || '';

  // Generate tailored platform copy
  const whatsappCaption = `✨ *Happy ${occasionName} from ${bizName}!* ✨\n\nMay this season bring you joy, peace, and remarkable prosperity. We truly value our connection with you!\n\nWarm regards,\n*${bizName}*\n${phone ? `📞 ${phone}\n` : ''}${email ? `✉️ ${email}\n` : ''}#${occasionName.replace(/[^a-zA-Z0-9]/g, '')} #${bizName.replace(/[^a-zA-Z0-9]/g, '')}`;

  const instagramCaption = `Warmest wishes to all our cherished clients, partners, and community members on this ${occasionName}! 🌟\n\nMay your celebrations be filled with light, laughter, and renewed success.\n\nFrom all of us at ${bizName}.\n.\n.\n#${occasionName.replace(/[^a-zA-Z0-9]/g, '')} #Celebration #${bizName.replace(/[^a-zA-Z0-9]/g, '')} #Nigeria #RelationshipMarketing #HappyHolidays`;

  const emailSubject = `Warm Wishes for a Joyful ${occasionName} from ${bizName}`;
  const emailBody = `Dear Valued Partner & Client,\n\nAs we celebrate ${occasionName}, everyone at ${bizName} wishes you peace, health, and sustained success.\n\nThank you for being an indispensable part of our journey.\n\nWarm regards,\n${business?.signOffName || bizName}\n${business?.signOffRole || 'Management'}\n${bizName}`;

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 16 }}
          className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 my-8 text-left"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-gray-400 hover:text-charcoal hover:bg-gray-100 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#1E824C]/10 text-[#1E824C] flex items-center justify-center font-bold">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#1E824C] bg-[#1E824C]/10 px-2 py-0.5 rounded">
                Campaign Approved
              </span>
              <h2 className="text-xl font-display font-extrabold text-charcoal tracking-tight mt-0.5">
                Ready to Engage & Distribute
              </h2>
            </div>
          </div>

          {/* Proactive Notification Banner */}
          {nextOccasion && (
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-xl bg-[#1E824C] text-white flex items-center justify-center shrink-0 mt-0.5">
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-[#1E824C] uppercase tracking-wide">
                    Next Campaign Horizon
                  </h4>
                  <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                    in {nextOccasion.daysLeft} days
                  </span>
                </div>
                <p className="text-xs text-emerald-950 mt-1 font-medium">
                  <strong>{nextOccasion.name}</strong> ({nextOccasion.dateStr}). Carditaur will proactively prepare your multi-size flyers 2 days prior!
                </p>
              </div>
            </div>
          )}

          {/* Tabs for platform copy */}
          <div className="flex items-center gap-2 border-b border-gray-150 pb-2 mb-4">
            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'whatsapp'
                  ? 'bg-[#25D366] text-white shadow-sm'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Status & Broadcast
            </button>
            <button
              onClick={() => setActiveTab('social')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'social'
                  ? 'bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white shadow-sm'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              <Instagram className="w-3.5 h-3.5" /> Instagram / Facebook
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'email'
                  ? 'bg-[#1E824C] text-white shadow-sm'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              <Mail className="w-3.5 h-3.5" /> Email Newsletter
            </button>
          </div>

          {/* Tab Content */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-6 relative">
            {activeTab === 'whatsapp' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    WhatsApp Greeting Caption
                  </span>
                  <button
                    onClick={() => handleCopy(whatsappCaption, 'whatsapp')}
                    className="text-xs font-bold text-[#1E824C] hover:underline flex items-center gap-1"
                  >
                    {copiedType === 'whatsapp' ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Copied to Clipboard!
                      </span>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Text
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-charcoal whitespace-pre-line font-sans leading-relaxed bg-white p-3 rounded-xl border border-gray-200">
                  {whatsappCaption}
                </p>
              </div>
            )}

            {activeTab === 'social' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Instagram Post Caption & Hashtags
                  </span>
                  <button
                    onClick={() => handleCopy(instagramCaption, 'social')}
                    className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
                  >
                    {copiedType === 'social' ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Copied to Clipboard!
                      </span>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Text
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-charcoal whitespace-pre-line font-sans leading-relaxed bg-white p-3 rounded-xl border border-gray-200">
                  {instagramCaption}
                </p>
              </div>
            )}

            {activeTab === 'email' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    Email Subject & Body
                  </span>
                  <button
                    onClick={() => handleCopy(`${emailSubject}\n\n${emailBody}`, 'email')}
                    className="text-xs font-bold text-[#1E824C] hover:underline flex items-center gap-1"
                  >
                    {copiedType === 'email' ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Copied to Clipboard!
                      </span>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Email
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-white p-3 rounded-xl border border-gray-200 space-y-2">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Subject:</span>
                    <p className="text-xs font-bold text-charcoal">{emailSubject}</p>
                  </div>
                  <div className="border-t border-gray-100 pt-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Body:</span>
                    <p className="text-xs text-charcoal whitespace-pre-line font-sans leading-relaxed mt-0.5">
                      {emailBody}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Download & Dismiss Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            {flyer?.imageUrl && (
              <a
                href={flyer.imageUrl}
                download={`${bizName.toLowerCase().replace(/\s+/g, '-')}-${occasionName.toLowerCase().replace(/\s+/g, '-')}-flyer.png`}
                className="w-full sm:w-auto px-6 py-3 bg-[#1E824C] hover:bg-[#155C34] text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Download High-Res PNG
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-3 bg-gray-100 hover:bg-gray-200 text-charcoal rounded-xl font-bold text-xs transition-all"
            >
              Done & Return to Studio
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
