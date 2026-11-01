import React, { useState, useEffect } from 'react';
import {
  Building2,
  User,
  Upload,
  Check,
  Calendar,
  AlertCircle,
  Plus,
  ArrowRight,
  ArrowLeft,
  X,
  Palette,
  Layers,
  CheckCircle2,
  Lock,
  RefreshCw
} from 'lucide-react';
import { extractColorsFromImage } from '../lib/colorExtractor';

export interface Occasion {
  id: string;
  name: string;
  category?: string;
  date?: string;
  is_dynamic_date?: boolean;
  countries?: string[];
  imageKeywords?: string[];
  designElements?: string[];
  suggestedColors?: string[];
  enabled?: boolean;
}

export const NIGERIAN_CORE_EVENTS = [
  'new_years_day',
  'good_friday',
  'easter_sunday',
  'easter_monday',
  'eid_al_fitr',
  'workers_day_labour_day',
  'democracy_day',
  'eid_al_adha',
  'mawlid_prophets_birthday',
  'nigeria_independence_day',
  'christmas',
  'boxing_day'
];

interface OnboardingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  occasions: Occasion[];
  onComplete: (bizData: any, generatedFlyers?: any[]) => Promise<void>;
  editingBusiness?: any;
}

// Clean helper to strip any legacy occ- or OCC- prefixes and title case
function cleanOccasionName(name: string, id: string): string {
  if (name && !name.toLowerCase().startsWith('occ-')) {
    return name;
  }
  const raw = (name || id || '').replace(/^occ-|^OCC-/i, '').replace(/[-_]/g, ' ');
  return raw
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export const OnboardingWizardModal: React.FC<OnboardingWizardModalProps> = ({
  isOpen,
  onClose,
  occasions,
  onComplete,
  editingBusiness,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Step 1: Identity & Branding
  const [profileType, setProfileType] = useState<'business' | 'individual'>(
    editingBusiness?.profileType || 'business'
  );
  const [name, setName] = useState<string>(editingBusiness?.businessName || '');
  const [industry, setIndustry] = useState<string>(
    editingBusiness?.industry || 'Logistics & Delivery'
  );
  const [industryDropdown, setIndustryDropdown] = useState<string>(
    editingBusiness?.industry || 'Logistics & Delivery'
  );
  const [customIndustry, setCustomIndustry] = useState<string>('');
  const [location, setLocation] = useState<string>(
    editingBusiness?.location || 'Lagos, Nigeria'
  );
  const [logoUrl, setLogoUrl] = useState<string>(
    editingBusiness?.logoUrl || ''
  );
  const [brandColor, setBrandColor] = useState<string>(
    editingBusiness?.brandColor || '#1E824C'
  );
  const [accentColor, setAccentColor] = useState<string>(
    editingBusiness?.accentColor || '#45B1E8'
  );
  const [extractedColors, setExtractedColors] = useState<string[]>(
    editingBusiness?.extractedColors || ['#1E824C', '#45B1E8', '#E8B14A', '#8854D0', '#2C3E50']
  );
  const [phone, setPhone] = useState<string>(editingBusiness?.phone || '');
  const [email, setEmail] = useState<string>(editingBusiness?.email || '');
  const [instagram, setInstagram] = useState<string>(editingBusiness?.instagram || '');

  // Step 2: Occasions & Calendar (Auto-subscribing all Nigerian religious & national core events)
  const [subscribedOccasions, setSubscribedOccasions] = useState<string[]>(() => {
    if (editingBusiness?.subscribedOccasions && editingBusiness.subscribedOccasions.length > 0) {
      // Map any old occ- IDs to clean IDs
      const cleaned = editingBusiness.subscribedOccasions.map((id: string) => id.replace(/^occ-/i, '').replace(/-/g, '_'));
      return Array.from(new Set([...cleaned, ...NIGERIAN_CORE_EVENTS]));
    }
    return [...NIGERIAN_CORE_EVENTS];
  });

  const [customEvents, setCustomEvents] = useState<any[]>(
    editingBusiness?.customEvents || []
  );
  const [showAddCustomEvent, setShowAddCustomEvent] = useState<boolean>(false);
  const [customEventName, setCustomEventName] = useState<string>('');
  const [customEventDate, setCustomEventDate] = useState<string>('');
  const [customEventType, setCustomEventType] = useState<'birthday' | 'anniversary' | 'other'>('birthday');

  // Step 3: Demo Flyer Preview
  const [selectedOccasionId, setSelectedOccasionId] = useState<string>('new_years_day');
  const [isGeneratingFlyer, setIsGeneratingFlyer] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [generationPhase, setGenerationPhase] = useState<string>('');
  const [generatedFlyers, setGeneratedFlyers] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Set default selected occasion when entering step 3
  useEffect(() => {
    if (subscribedOccasions.length > 0 && (!selectedOccasionId || !subscribedOccasions.includes(selectedOccasionId))) {
      setSelectedOccasionId(subscribedOccasions[0]);
    }
  }, [subscribedOccasions, selectedOccasionId]);

  if (!isOpen) return null;

  // Handle Logo Upload and Color Extraction
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setLogoUrl(dataUrl);

      // Extract 5 dominant brand colors using canvas color clustering
      extractColorsFromImage(dataUrl, (palette, primary, accent) => {
        setExtractedColors(palette);
        setBrandColor(primary);
        setAccentColor(accent);
      });
    };
    reader.readAsDataURL(file);
  };

  const toggleOccasion = (occId: string) => {
    // Core Nigerian religious and statutory holidays are locked and automatically subscribed
    if (NIGERIAN_CORE_EVENTS.includes(occId)) {
      return;
    }
    setSubscribedOccasions((prev) =>
      prev.includes(occId) ? prev.filter((id) => id !== occId) : [...prev, occId]
    );
  };

  const handleAddCustomEvent = () => {
    if (!customEventName.trim() || !customEventDate) return;
    const parts = customEventDate.split('-');
    const formatted = parts.length === 3 ? `${parts[1]}-${parts[2]}` : customEventDate;
    const newEvt = {
      id: `custom_${Date.now()}`,
      name: customEventName.trim(),
      date: formatted,
      type: customEventType,
      isAnnual: true,
    };
    setCustomEvents((prev) => [...prev, newEvt]);
    setCustomEventName('');
    setCustomEventDate('');
    setShowAddCustomEvent(false);
  };

  // Trigger Demo Flyer Generation (1 single demo flyer variation)
  const handleGenerateDemoFlyer = async () => {
    if (!name.trim()) {
      setErrorMsg('Please specify your business name first.');
      setCurrentStep(1);
      return;
    }
    const occId = selectedOccasionId || subscribedOccasions[0] || 'new_years_day';

    setIsGeneratingFlyer(true);
    setGenerationProgress(15);
    setGenerationPhase('Analyzing Brand Identity & Typography...');

    const phases = [
      'Crafting Nigerian Relationship Copy...',
      'Synthesizing 1 Demo Flyer (Ideogram Engine)...',
      'Applying Extracted Brand Color Palette...',
      'Finalizing Single Preview Layout...',
    ];

    let pIdx = 0;
    const phaseTimer = setInterval(() => {
      pIdx = (pIdx + 1) % phases.length;
      setGenerationPhase(phases[pIdx]);
    }, 1800);

    const progressTimer = setInterval(() => {
      setGenerationProgress((prev) => (prev < 92 ? prev + Math.floor(Math.random() * 8) + 4 : 92));
    }, 400);

    try {
      const targetOccasion = occasions.find((o) => o.id === occId);
      const res = await fetch('/api/generate-flyers-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sizePreset: 'square',
          businessId: editingBusiness?.id || 'temp-onboarding',
          occasionId: occId,
          width: 1080,
          height: 1080,
          numImages: 1, // Only 1 variation for demo as requested
          overrideOccasionName: targetOccasion ? cleanOccasionName(targetOccasion.name, targetOccasion.id) : undefined,
          tempBiz: {
            businessName: name.trim(),
            industry,
            location,
            brandColor,
            accentColor,
            extractedColors,
            logoUrl,
            phone,
            email,
            instagram,
            brandTone: 'corporate',
          },
        }),
      });

      clearInterval(phaseTimer);
      clearInterval(progressTimer);
      setGenerationProgress(100);

      if (res.ok) {
        const data = await res.json();
        setGeneratedFlyers(data.flyers || []);
      } else {
        const errData = await res.json().catch(() => null);
        setErrorMsg(errData?.error || 'Could not complete demo generation. You can skip and launch studio directly.');
      }
    } catch (err: any) {
      clearInterval(phaseTimer);
      clearInterval(progressTimer);
      console.error('Demo flyer generation error:', err);
      setErrorMsg('Demo generation network error. You can skip and proceed to studio.');
    } finally {
      setIsGeneratingFlyer(false);
    }
  };

  // Final Complete Handler
  const handleFinalComplete = async () => {
    setErrorMsg(null);
    if (!name.trim()) {
      setErrorMsg('Company / Display Name is required.');
      setCurrentStep(1);
      return;
    }
    const finalOccasions = Array.from(new Set([...subscribedOccasions, ...NIGERIAN_CORE_EVENTS]));

    setIsSaving(true);
    try {
      const payload = {
        businessName: name.trim(),
        industry,
        location: location || 'Lagos, Nigeria',
        logoUrl,
        brandColor,
        accentColor,
        extractedColors,
        subscribedOccasions: finalOccasions,
        countries: ['Nigeria'],
        businessType: 'Both',
        brandTone: 'corporate',
        profileType,
        customEvents,
        phone,
        email,
        instagram,
      };

      await onComplete(payload, generatedFlyers);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[500] bg-white flex flex-col w-full h-full overflow-y-auto font-sans selection:bg-[#1E824C] selection:text-white">
      {/* Container max width */}
      <div className="w-full max-w-3xl mx-auto flex-1 flex flex-col justify-between p-6 sm:p-10 min-h-screen text-left">
        {/* Top Header */}
        <div className="space-y-4 shrink-0">
          <div className="flex justify-between items-center border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="text-xl font-black text-[#1E824C] font-display tracking-tight">Carditaur</span>
              <span className="text-[10px] bg-emerald-50 text-[#1E824C] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border border-emerald-200">
                Setup Campaign Profile
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-gray-500 uppercase tracking-wider bg-gray-50 border border-gray-200 px-3 py-1 rounded-full">
                Step {currentStep} of 3
              </span>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { num: 1, title: '1. Brand Profile & Colors', color: '#1E824C' },
              { num: 2, title: '2. Celebration Calendar', color: '#45B1E8' },
              { num: 3, title: '3. See a Demo', color: '#1E824C' },
            ].map((st) => {
              const isPast = currentStep > st.num;
              const isActive = currentStep === st.num;
              return (
                <button
                  key={st.num}
                  type="button"
                  onClick={() => {
                    if (st.num > 1 && !name.trim()) {
                      setErrorMsg('Please enter your business name first.');
                      return;
                    }
                    setErrorMsg(null);
                    setCurrentStep(st.num);
                  }}
                  className="flex flex-col gap-1.5 text-left border-none bg-transparent cursor-pointer group"
                >
                  <div
                    className="h-2 w-full rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: isPast || isActive ? st.color : '#E5E7EB',
                      opacity: isActive ? 1 : isPast ? 0.7 : 0.3,
                    }}
                  />
                  <span
                    className="text-[11px] font-extrabold uppercase tracking-wider truncate"
                    style={{ color: isPast || isActive ? st.color : '#9CA3AF' }}
                  >
                    {st.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="my-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl p-3.5 text-xs font-bold font-sans flex items-start gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMsg}</div>
            <button type="button" onClick={() => setErrorMsg(null)} className="text-rose-500 hover:text-rose-800">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Form Body */}
        <div className="flex-grow py-6 overflow-visible">
          {/* STEP 1: BUSINESS INFO & BRANDING */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-display font-extrabold text-gray-900 tracking-tight">
                  Tell us about your brand
                </h3>
                <p className="text-xs text-gray-500 font-sans mt-0.5">
                  We use your brand details to auto-generate personalized, print-ready flyers and captions.
                </p>
              </div>

              {/* Profile Type Toggle */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setProfileType('business');
                    setIndustry('Logistics & Delivery');
                  }}
                  className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
                    profileType === 'business'
                      ? 'bg-[#1E824C]/5 border-[#1E824C] ring-2 ring-[#1E824C]/20 font-bold text-[#1E824C]'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Building2 className="w-5 h-5 shrink-0" />
                  <div className="text-left leading-tight">
                    <div className="text-xs font-extrabold">Company / Business</div>
                    <div className="text-[10px] opacity-75 font-normal">For corporate campaigns & flyering</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProfileType('individual');
                    setIndustry('Personal');
                  }}
                  className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
                    profileType === 'individual'
                      ? 'bg-[#1E824C]/5 border-[#1E824C] ring-2 ring-[#1E824C]/20 font-bold text-[#1E824C]'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <User className="w-5 h-5 shrink-0" />
                  <div className="text-left leading-tight">
                    <div className="text-xs font-extrabold">Individual / Professional</div>
                    <div className="text-[10px] opacity-75 font-normal">For personal greetings & branding</div>
                  </div>
                </button>
              </div>

              {/* Name & Industry Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    {profileType === 'business' ? 'Company / Brand Name *' : 'Your Full / Display Name *'}
                  </label>
                  <input
                    type="text"
                    placeholder={profileType === 'business' ? 'e.g. Apex Logistics' : 'e.g. Kolawole Davies'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1E824C] focus:bg-white text-sm text-gray-900 placeholder-gray-400 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Industry Sector
                  </label>
                  <select
                    value={industryDropdown}
                    onChange={(e) => {
                      const val = e.target.value;
                      setIndustryDropdown(val);
                      if (val === 'Custom') {
                        setIndustry(customIndustry || 'Custom');
                      } else {
                        setIndustry(val);
                      }
                    }}
                    className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1E824C] focus:bg-white text-sm text-gray-900 font-sans"
                  >
                    <option value="Logistics & Delivery">Logistics & Delivery</option>
                    <option value="Retail & E-commerce">Retail & E-commerce</option>
                    <option value="Professional Services">Professional Services</option>
                    <option value="Technology & Software">Technology & Software</option>
                    <option value="Fintech & Banking">Fintech & Banking</option>
                    <option value="Fashion & Aesthetics">Fashion & Aesthetics</option>
                    <option value="Healthcare & Wellness">Healthcare & Wellness</option>
                    <option value="Food & Hospitality">Food & Hospitality</option>
                    <option value="Education & Consulting">Education & Consulting</option>
                    <option value="Custom">Other (Custom Category...)</option>
                  </select>
                  {industryDropdown === 'Custom' && (
                    <input
                      type="text"
                      placeholder="Enter custom industry..."
                      value={customIndustry}
                      onChange={(e) => {
                        setCustomIndustry(e.target.value);
                        setIndustry(e.target.value);
                      }}
                      className="mt-2 block w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs"
                    />
                  )}
                </div>
              </div>

              {/* Location Input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Business Location / State
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lagos, Nigeria"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1E824C] focus:bg-white text-sm text-gray-900 font-sans"
                />
              </div>

              {/* Logo & Brand Colors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Logo Upload Box */}
                <div className="border-2 border-dashed border-gray-200 hover:border-[#1E824C] bg-gray-50/50 rounded-2xl p-4 text-center relative flex flex-col justify-center items-center group transition-colors min-h-[160px]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  {logoUrl ? (
                    <div className="flex flex-col items-center gap-2 z-20">
                      <img
                        src={logoUrl}
                        alt="Logo preview"
                        className="w-14 h-14 object-contain rounded-xl border border-gray-200 bg-white p-1 shadow-sm"
                      />
                      <span className="text-[10px] text-[#1E824C] font-bold flex items-center gap-1 bg-[#1E824C]/10 px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3" /> Logo Attached
                      </span>
                      <span className="text-[9px] text-gray-400">Click or drop to replace</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-7 h-7 text-[#1E824C] mb-1.5 group-hover:scale-105 transition-transform" />
                      <span className="text-xs font-bold text-gray-700">Upload Brand Logo</span>
                      <span className="text-[10px] text-gray-400 mt-0.5">Auto-extracts 5 brand colors</span>
                    </>
                  )}
                </div>

                {/* Brand Colors Box with 5 Extracted Color Circles */}
                <div className="border border-gray-200 bg-white rounded-2xl p-4 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Brand Colors (5 Extracted)
                      </span>
                      <Palette className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                    <p className="text-[10px] text-gray-400">
                      Sampled directly from your logo. Click any circle to assign.
                    </p>
                  </div>

                  {/* 5 Extracted Color Circles */}
                  <div className="flex items-center gap-2.5 py-1">
                    {extractedColors.slice(0, 5).map((col, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          if (idx === 0) setBrandColor(col);
                          else setAccentColor(col);
                        }}
                        title={`Click to use ${col}`}
                        className="group relative flex flex-col items-center cursor-pointer transition-transform hover:scale-110 focus:outline-none"
                      >
                        <div
                          className={`w-7 h-7 rounded-full shadow-xs border-2 transition-all ${
                            brandColor === col
                              ? 'border-gray-900 ring-2 ring-[#1E824C]'
                              : accentColor === col
                              ? 'border-[#45B1E8] ring-2 ring-[#45B1E8]'
                              : 'border-white'
                          }`}
                          style={{ backgroundColor: col }}
                        />
                        <span className="text-[8px] font-mono text-gray-400 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {col.slice(0, 4)}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Primary & Accent Selection */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100">
                    <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                      <input
                        type="color"
                        value={brandColor}
                        onChange={(e) => setBrandColor(e.target.value)}
                        className="w-6 h-6 rounded-lg cursor-pointer border-none bg-transparent"
                      />
                      <div className="text-left">
                        <span className="text-[8px] font-bold text-gray-400 uppercase block">Primary</span>
                        <span className="text-[11px] font-mono font-bold text-gray-800">{brandColor}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-6 h-6 rounded-lg cursor-pointer border-none bg-transparent"
                      />
                      <div className="text-left">
                        <span className="text-[8px] font-bold text-gray-400 uppercase block">Accent</span>
                        <span className="text-[11px] font-mono font-bold text-gray-800">{accentColor}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Optional Contact Channels */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +234 80 1234 5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. hello@brand.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                    Instagram Handle (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. mybrand"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value.replace('@', ''))}
                    className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: OCCASIONS & CALENDAR */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-display font-extrabold text-gray-900 tracking-tight">
                    Holiday & celebration calendar
                  </h3>
                  <p className="text-xs text-gray-500 font-sans mt-0.5">
                    All Nigerian religious holidays (Eid, Easter, Christmas, Maulud) & national statutory holidays are automatically subscribed.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-[#1E824C] bg-[#1E824C]/10 px-2.5 py-1 rounded-full">
                    {subscribedOccasions.length} Occasions Subscribed
                  </span>
                </div>
              </div>

              {/* Occasions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                {occasions
                  .filter((o) => o.enabled !== false)
                  .map((occ) => {
                    const isCore = NIGERIAN_CORE_EVENTS.includes(occ.id);
                    const isSelected = isCore || subscribedOccasions.includes(occ.id);
                    const displayName = cleanOccasionName(occ.name, occ.id);

                    return (
                      <button
                        key={occ.id}
                        type="button"
                        onClick={() => toggleOccasion(occ.id)}
                        disabled={isCore}
                        className={`p-3 rounded-xl border text-left flex items-start justify-between gap-2 transition-all ${
                          isCore
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 cursor-default'
                            : isSelected
                            ? 'bg-[#1E824C]/5 border-[#1E824C] text-[#1E824C] font-bold shadow-xs cursor-pointer'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold truncate leading-tight">{displayName}</h4>
                            {isCore && <Lock className="w-2.5 h-2.5 text-emerald-600 shrink-0" />}
                          </div>
                          <span className="text-[10px] font-mono text-gray-500 block mt-0.5">
                            {occ.date || 'Seasonal'} • {isCore ? 'Auto Subscribed' : occ.category || 'National'}
                          </span>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected ? 'bg-[#1E824C] text-white' : 'bg-gray-100 text-transparent'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      </button>
                    );
                  })}
              </div>

              {/* Add Custom Milestone Box */}
              <div className="border border-gray-200 bg-gray-50/50 rounded-2xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#45B1E8]" /> Custom Celebrations & Milestones
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddCustomEvent(!showAddCustomEvent)}
                    className="text-xs font-bold text-[#45B1E8] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Birthday / Anniversary
                  </button>
                </div>

                {showAddCustomEvent && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="Event name (e.g. Founder Birthday)"
                      value={customEventName}
                      onChange={(e) => setCustomEventName(e.target.value)}
                      className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                    />
                    <input
                      type="date"
                      value={customEventDate}
                      onChange={(e) => setCustomEventDate(e.target.value)}
                      className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomEvent}
                      className="px-4 py-2 bg-[#45B1E8] hover:bg-[#3498db] text-white font-bold text-xs rounded-xl shadow-xs"
                    >
                      Save Milestone
                    </button>
                  </div>
                )}

                {customEvents.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {customEvents.map((evt) => (
                      <span
                        key={evt.id}
                        className="inline-flex items-center gap-1.5 bg-white border border-gray-200 px-2.5 py-1 rounded-lg text-xs font-medium text-gray-900 shadow-2xs"
                      >
                        {evt.name} ({evt.date})
                        <button
                          type="button"
                          onClick={() => setCustomEvents((prev) => prev.filter((e) => e.id !== evt.id))}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: SEE A DEMO */}
          {currentStep === 3 && (
            <div className="space-y-6 text-center">
              <div>
                <h3 className="text-lg font-display font-extrabold text-gray-900 tracking-tight">
                  See a Demo
                </h3>
                <p className="text-xs text-gray-500 font-sans mt-0.5">
                  Generate a sample flyer to preview your brand styling and tailored occasion copywriting.
                </p>
              </div>

              {/* Choose Occasion for flyer with clean names */}
              <div className="max-w-md mx-auto flex items-center justify-center gap-3">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider shrink-0">
                  Target Occasion:
                </label>
                <select
                  value={selectedOccasionId}
                  onChange={(e) => setSelectedOccasionId(e.target.value)}
                  className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:ring-2 focus:ring-[#1E824C]"
                >
                  {subscribedOccasions.map((occId) => {
                    const occ = occasions.find((o) => o.id === occId);
                    const cleanName = occ ? cleanOccasionName(occ.name, occ.id) : cleanOccasionName(occId, occId);
                    return (
                      <option key={occId} value={occId}>
                        {cleanName}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Generation Box */}
              {isGeneratingFlyer ? (
                <div className="py-10 flex flex-col items-center justify-center space-y-4 max-w-md mx-auto">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-[3px] border-gray-100 animate-pulse" />
                    <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#1E824C] animate-spin" />
                    <span className="text-gray-900 text-xs font-mono font-black">{generationProgress}%</span>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-gray-900">Composing Demo Flyer</h4>
                    <p className="text-xs text-gray-500 font-mono">{generationPhase}</p>
                  </div>
                </div>
              ) : generatedFlyers.length > 0 ? (
                <div className="space-y-4 max-w-md mx-auto">
                  {/* Single Demo Flyer Display */}
                  <div className="relative aspect-square max-h-[300px] mx-auto rounded-2xl overflow-hidden border border-gray-200 shadow-md bg-white">
                    <img
                      src={generatedFlyers[0]?.imageUrl}
                      alt="Demo Generated Flyer"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                      {name || 'Demo Preview'}
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleGenerateDemoFlyer}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Re-run Demo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-8 space-y-4 max-w-md mx-auto">
                  <div className="w-14 h-14 bg-emerald-50 text-[#1E824C] rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
                    <Layers className="w-7 h-7" />
                  </div>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto">
                    Preview how your brand colors, logo, and company name "{name || 'Your Brand'}" look on a sample celebration flyer.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleGenerateDemoFlyer}
                      className="px-6 py-3 bg-[#1E824C] hover:bg-[#155C34] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                    >
                      <Layers className="w-4 h-4" /> Run Demo Preview
                    </button>
                    <button
                      type="button"
                      onClick={handleFinalComplete}
                      disabled={isSaving}
                      className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-all cursor-pointer w-full sm:w-auto"
                    >
                      Skip Demo & Finish
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Floating / Bottom Navigation Controls */}
        <div className="pt-6 border-t border-gray-100 flex items-center justify-between shrink-0">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => {
                setErrorMsg(null);
                setCurrentStep(currentStep - 1);
              }}
              className="px-5 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
          )}

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={() => {
                setErrorMsg(null);
                if (currentStep === 1 && !name.trim()) {
                  setErrorMsg('Please specify your business or display name.');
                  return;
                }
                setCurrentStep(currentStep + 1);
              }}
              className="px-6 py-2.5 bg-[#1E824C] hover:bg-[#155C34] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              Next Step <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalComplete}
              disabled={isSaving}
              className="px-8 py-3 bg-[#1E824C] hover:bg-[#155C34] active:bg-[#0E3D22] text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>Saving & Launching Studio...</>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Complete & Launch Studio
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
