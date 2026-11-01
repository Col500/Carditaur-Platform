import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Image as ImageIcon, 
  Folder, 
  UploadCloud, 
  Plus, 
  Trash2, 
  Edit3, 
  Copy, 
  Check, 
  ExternalLink, 
  FileText, 
  Layers, 
  X, 
  Search, 
  Tag, 
  Maximize2, 
  RefreshCw, 
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface ReferencePoster {
  id: string;
  filename: string;
  imageUrl: string;
  title: string;
  category: string;
  tags: string[];
  notes?: string;
  aspectRatio?: string;
  dateAdded: string;
}

interface PromptAndReferenceLibraryProps {
  onClose?: () => void;
  initialTab?: 'prompts' | 'references';
}

export const PromptAndReferenceLibrary: React.FC<PromptAndReferenceLibraryProps> = ({
  onClose,
  initialTab = 'prompts'
}) => {
  const [activeTab, setActiveTab] = useState<'prompts' | 'references'>(initialTab);
  
  // Prompts State
  const [prompts, setPrompts] = useState<string[]>([]);
  const [loadingPrompts, setLoadingPrompts] = useState(false);
  const [promptSearch, setPromptSearch] = useState('');
  const [newPromptText, setNewPromptText] = useState('');
  const [editingPromptIndex, setEditingPromptIndex] = useState<number | null>(null);
  const [editingPromptText, setEditingPromptText] = useState('');
  const [copiedPromptIndex, setCopiedPromptIndex] = useState<number | null>(null);
  const [showAddPromptModal, setShowAddPromptModal] = useState(false);

  // References State
  const [references, setReferences] = useState<ReferencePoster[]>([]);
  const [loadingReferences, setLoadingReferences] = useState(false);
  const [referenceSearch, setReferenceSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImageModal, setPreviewImageModal] = useState<ReferencePoster | null>(null);
  const [editingRefModal, setEditingRefModal] = useState<ReferencePoster | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Categories for reference posters
  const CATEGORIES = [
    'All',
    'Editorial / Poster',
    'Corporate & Professional',
    'Luxury & Minimalist',
    'Cultural & Festive',
    'Vibrant & Modern',
    'Retail & Product',
    'Wellness & Nature'
  ];

  // Fetch data on load with resilient retry
  useEffect(() => {
    let isMounted = true;

    const loadData = async (retryCount = 0) => {
      try {
        setLoadingPrompts(true);
        setLoadingReferences(true);

        const [promptsRes, refsRes] = await Promise.allSettled([
          fetch('/api/admin/prompts'),
          fetch('/api/admin/references')
        ]);

        if (!isMounted) return;

        if (promptsRes.status === 'fulfilled' && promptsRes.value.ok) {
          const pData = await promptsRes.value.json();
          if (pData.success && isMounted) {
            setPrompts(pData.prompts || []);
          }
        } else if (retryCount < 2) {
          setTimeout(() => loadData(retryCount + 1), 1000);
          return;
        }

        if (refsRes.status === 'fulfilled' && refsRes.value.ok) {
          const rData = await refsRes.value.json();
          if (rData.success && isMounted) {
            setReferences(rData.references || []);
          }
        }
      } catch {
        if (retryCount < 2 && isMounted) {
          setTimeout(() => loadData(retryCount + 1), 1000);
        }
      } finally {
        if (isMounted) {
          setLoadingPrompts(false);
          setLoadingReferences(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const fetchPrompts = async () => {
    setLoadingPrompts(true);
    try {
      const res = await fetch('/api/admin/prompts');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setPrompts(data.prompts || []);
        }
      }
    } catch {
      // Graceful fallback without unhandled console error
    } finally {
      setLoadingPrompts(false);
    }
  };

  const fetchReferences = async () => {
    setLoadingReferences(true);
    try {
      const res = await fetch('/api/admin/references');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setReferences(data.references || []);
        }
      }
    } catch {
      // Graceful fallback without unhandled console error
    } finally {
      setLoadingReferences(false);
    }
  };

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Prompt Handlers
  const handleAddPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromptText.trim()) return;

    try {
      const res = await fetch('/api/admin/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptText: newPromptText.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setPrompts(data.prompts);
        setNewPromptText('');
        setShowAddPromptModal(false);
        showNotification('Prompt successfully added to library!');
      } else {
        showNotification(data.error || 'Failed to add prompt', 'error');
      }
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  const handleUpdatePrompt = async (idx: number) => {
    if (!editingPromptText.trim()) return;

    try {
      const res = await fetch(`/api/admin/prompts/${idx}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptText: editingPromptText.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setPrompts(data.prompts);
        setEditingPromptIndex(null);
        setEditingPromptText('');
        showNotification('Prompt successfully updated!');
      } else {
        showNotification(data.error || 'Failed to update prompt', 'error');
      }
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  const handleDeletePrompt = async (idx: number) => {
    if (!window.confirm('Are you sure you want to remove this prompt from your library?')) return;

    try {
      const res = await fetch(`/api/admin/prompts/${idx}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setPrompts(data.prompts);
        showNotification('Prompt removed from library.');
      } else {
        showNotification(data.error || 'Failed to delete prompt', 'error');
      }
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  const handleCopyPrompt = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptIndex(idx);
    setTimeout(() => setCopiedPromptIndex(null), 2500);
  };

  // Reference Upload Handlers
  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    setIsUploading(true);
    setUploadProgress(10);

    const itemsToUpload: Array<{ dataUrl: string; name: string; title: string; category: string; tags: string[] }> = [];

    try {
      let processed = 0;
      for (const file of fileArray) {
        if (!file.type.startsWith('image/')) continue;

        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        itemsToUpload.push({
          dataUrl,
          name: file.name,
          title: cleanName,
          category: selectedCategory === 'All' ? 'Editorial / Poster' : selectedCategory,
          tags: ['Reference', 'Style Guide']
        });

        processed++;
        setUploadProgress(10 + Math.round((processed / fileArray.length) * 50));
      }

      if (itemsToUpload.length === 0) {
        showNotification('No valid images selected for upload.', 'error');
        setIsUploading(false);
        return;
      }

      setUploadProgress(75);
      const res = await fetch('/api/admin/references/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsToUpload })
      });
      const data = await res.json();

      setUploadProgress(100);
      if (data.success) {
        setReferences(data.references);
        showNotification(`Successfully uploaded ${itemsToUpload.length} reference poster${itemsToUpload.length > 1 ? 's' : ''}!`);
      } else {
        showNotification(data.error || 'Failed to upload references', 'error');
      }
    } catch (err: any) {
      showNotification('Error processing uploads: ' + err.message, 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteReference = async (id: string) => {
    if (!window.confirm('Delete this reference poster from the library?')) return;

    try {
      const res = await fetch(`/api/admin/references/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setReferences(data.references);
        if (previewImageModal?.id === id) setPreviewImageModal(null);
        showNotification('Reference poster deleted.');
      } else {
        showNotification(data.error || 'Failed to delete reference', 'error');
      }
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  const handleUpdateReference = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRefModal) return;

    try {
      const res = await fetch(`/api/admin/references/${editingRefModal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingRefModal.title,
          category: editingRefModal.category,
          tags: editingRefModal.tags,
          notes: editingRefModal.notes
        })
      });
      const data = await res.json();
      if (data.success) {
        setReferences(data.references);
        setEditingRefModal(null);
        showNotification('Reference poster metadata updated!');
      } else {
        showNotification(data.error || 'Failed to update metadata', 'error');
      }
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  // Filtered lists
  const filteredPrompts = prompts.filter(p => 
    p.toLowerCase().includes(promptSearch.toLowerCase())
  );

  const filteredReferences = references.filter(r => {
    const matchesCategory = selectedCategory === 'All' || r.category === selectedCategory;
    const matchesSearch = 
      r.title.toLowerCase().includes(referenceSearch.toLowerCase()) ||
      r.notes?.toLowerCase().includes(referenceSearch.toLowerCase()) ||
      r.tags.some(t => t.toLowerCase().includes(referenceSearch.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full bg-[#FAF9F5] text-slate-900 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1E824C]/10 flex items-center justify-center text-[#1E824C]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-display text-slate-900 tracking-tight flex items-center gap-2">
                Creative Inspiration & Reference Hub
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                Manage your prompt library and gather 50–100 reference posters for Ideogram & Gemini.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Controls & Close */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200/80">
            <button
              onClick={() => setActiveTab('prompts')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'prompts'
                  ? 'bg-white text-[#1E824C] shadow-xs'
                  : 'text-gray-500 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Prompt Library</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                activeTab === 'prompts' ? 'bg-[#1E824C]/10 text-[#1E824C]' : 'bg-gray-200 text-gray-600'
              }`}>
                {prompts.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('references')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'references'
                  ? 'bg-white text-[#1E824C] shadow-xs'
                  : 'text-gray-500 hover:text-slate-900'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Reference Posters</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                activeTab === 'references' ? 'bg-[#1E824C]/10 text-[#1E824C]' : 'bg-gray-200 text-gray-600'
              }`}>
                {references.length} / 100
              </span>
            </button>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-gray-600 hover:text-slate-900 transition-colors"
              title="Close Hub"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Notification banner */}
      {statusMessage && (
        <div className={`px-6 py-2.5 text-xs font-bold flex items-center gap-2 animate-fade-in ${
          statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200' : 'bg-rose-50 text-rose-800 border-b border-rose-200'
        }`}>
          {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'prompts' ? (
          /* ======================================================== */
          /* TAB 1: PROMPT LIBRARY                                   */
          /* ======================================================== */
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Top Toolbar */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={promptSearch}
                    onChange={(e) => setPromptSearch(e.target.value)}
                    placeholder="Search stored prompts by keyword..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs text-slate-800 placeholder-gray-400 focus:bg-white focus:border-[#1E824C] focus:ring-1 focus:ring-[#1E824C] outline-none"
                  />
                </div>
                <button
                  onClick={fetchPrompts}
                  disabled={loadingPrompts}
                  className="p-2 text-gray-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-gray-200 rounded-xl transition-all"
                  title="Refresh prompts"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingPrompts ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-xs text-gray-500 font-mono">
                  Stored at: <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">/data/example_prompts.json</span>
                </div>
                <button
                  onClick={() => {
                    setNewPromptText('');
                    setShowAddPromptModal(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#1E824C] hover:bg-[#155A34] text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Prompt</span>
                </button>
              </div>
            </div>

            {/* Prompt Cards Grid */}
            {loadingPrompts ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-[#1E824C] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-gray-500 font-medium">Loading prompt library...</p>
              </div>
            ) : filteredPrompts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-800">No Prompts Found</h3>
                  <p className="text-xs text-gray-500 max-w-md mx-auto">
                    {promptSearch ? 'No prompts matching your search filter.' : 'Your prompt library currently has no custom prompts. Add your favorite flyer and poster prompts to train the AI!'}
                  </p>
                </div>
                <button
                  onClick={() => setShowAddPromptModal(true)}
                  className="px-4 py-2 bg-[#1E824C] text-white text-xs font-bold rounded-xl shadow-sm hover:opacity-90"
                >
                  Add First Prompt
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredPrompts.map((promptStr, idx) => {
                  const isEditing = editingPromptIndex === idx;
                  const wordCount = promptStr.split(/\s+/).filter(Boolean).length;
                  const charCount = promptStr.length;

                  return (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-gray-300 shadow-xs hover:shadow-sm transition-all space-y-3 relative group"
                    >
                      {/* Top Bar of Prompt Card */}
                      <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold bg-[#1E824C]/10 text-[#1E824C] px-2 py-0.5 rounded-md">
                            Prompt #{idx + 1}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {wordCount} words • {charCount} chars
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleCopyPrompt(promptStr, idx)}
                            className="p-1.5 text-gray-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 text-[11px]"
                            title="Copy prompt text"
                          >
                            {copiedPromptIndex === idx ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-emerald-600 font-bold">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Copy</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => {
                              setEditingPromptIndex(idx);
                              setEditingPromptText(promptStr);
                            }}
                            className="p-1.5 text-gray-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 text-[11px]"
                            title="Edit prompt text"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Edit</span>
                          </button>

                          <button
                            onClick={() => handleDeletePrompt(idx)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete prompt"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Content Area */}
                      {isEditing ? (
                        <div className="space-y-3 pt-1">
                          <textarea
                            value={editingPromptText}
                            onChange={(e) => setEditingPromptText(e.target.value)}
                            rows={6}
                            className="w-full p-3 bg-slate-50 border border-[#1E824C] rounded-xl text-xs font-mono text-slate-800 outline-none leading-relaxed"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingPromptIndex(null);
                                setEditingPromptText('');
                              }}
                              className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleUpdatePrompt(idx)}
                              className="px-4 py-1.5 bg-[#1E824C] hover:bg-[#155A34] text-white text-xs font-bold rounded-lg shadow-xs"
                            >
                              Save Changes
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="font-mono text-xs text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                          {promptStr}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* ======================================================== */
          /* TAB 2: REFERENCE POSTERS GALLERY (50-100 TARGET)         */
          /* ======================================================== */
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Target Capacity & Folder Info Card */}
            <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider font-mono text-[#1E824C] bg-[#1E824C]/10 px-2 py-0.5 rounded">
                      Ideogram Reference Vault
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-slate-600 font-bold">
                      {references.length} of 100 Reference Posters Loaded
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    Posters saved here are stored in <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono font-bold">/public/reference_posters</code> and used to condition Ideogram & Gemini flyer compositions.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFilesSelected(e.target.files)}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1E824C] hover:bg-[#155A34] text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Upload Posters</span>
                  </button>
                </div>
              </div>

              {/* Progress bar towards 100 images */}
              <div className="space-y-1.5">
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="bg-gradient-to-r from-[#1E824C] to-[#39FF14] h-full transition-all duration-500 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(references.length, 2))}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                  <span>0 Posters</span>
                  <span>50 Target</span>
                  <span>100 Max Capacity</span>
                </div>
              </div>

              {/* Uploading progress indicator */}
              {isUploading && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 animate-fade-in">
                  <div className="flex justify-between text-xs font-bold text-emerald-800">
                    <span>Uploading and optimizing reference posters...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-emerald-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Filter & Category Selector */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-50 text-gray-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search bar */}
              <div className="relative min-w-[200px] md:w-64">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={referenceSearch}
                  onChange={(e) => setReferenceSearch(e.target.value)}
                  placeholder="Filter references..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-gray-200 rounded-xl text-xs text-slate-800 placeholder-gray-400 focus:bg-white focus:border-[#1E824C] outline-none"
                />
              </div>
            </div>

            {/* Drag and Drop Zone / Gallery */}
            {references.length === 0 ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFilesSelected(e.dataTransfer.files);
                }}
                onClick={() => fileInputRef.current?.click()}
                className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-300 hover:border-[#1E824C] transition-colors cursor-pointer space-y-4 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#1E824C]/10 group-hover:bg-[#1E824C]/20 text-[#1E824C] flex items-center justify-center mx-auto transition-transform group-hover:scale-105">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div className="space-y-1.5 max-w-md mx-auto">
                  <h3 className="text-base font-bold text-slate-800">
                    Drop your 50–100 reference posters here
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Select high-quality flyers, event posters, typographic layouts, and social cards. Drag and drop multiple files directly or click to browse.
                  </p>
                </div>
                <button
                  type="button"
                  className="px-5 py-2.5 bg-[#1E824C] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#155A34]"
                >
                  Select Posters from Computer
                </button>
              </div>
            ) : filteredReferences.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300 space-y-2">
                <p className="text-xs text-gray-500">No reference posters match your active category/search filter.</p>
                <button
                  onClick={() => { setSelectedCategory('All'); setReferenceSearch(''); }}
                  className="text-xs font-bold text-[#1E824C] hover:underline"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredReferences.map((ref) => (
                  <div
                    key={ref.id}
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col"
                  >
                    {/* Image Container */}
                    <div className="relative aspect-[4/5] bg-slate-100 overflow-hidden cursor-pointer" onClick={() => setPreviewImageModal(ref)}>
                      <img
                        src={ref.imageUrl}
                        alt={ref.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewImageModal(ref);
                          }}
                          className="p-2 bg-white/90 hover:bg-white text-slate-800 rounded-full shadow-sm transition-transform active:scale-90"
                          title="Zoom preview"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingRefModal(ref);
                          }}
                          className="p-2 bg-white/90 hover:bg-white text-slate-800 rounded-full shadow-sm transition-transform active:scale-90"
                          title="Edit metadata"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteReference(ref.id);
                          }}
                          className="p-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full shadow-sm transition-transform active:scale-90"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Category Pill */}
                      <span className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-md">
                        {ref.category}
                      </span>
                    </div>

                    {/* Metadata Card Footer */}
                    <div className="p-3 flex-1 flex flex-col justify-between space-y-1.5 text-left bg-white">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 truncate" title={ref.title}>
                          {ref.title}
                        </h4>
                        {ref.notes && (
                          <p className="text-[10px] text-gray-500 line-clamp-2 mt-0.5 leading-tight">
                            {ref.notes}
                          </p>
                        )}
                      </div>

                      {/* Tags */}
                      {ref.tags && ref.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {ref.tags.slice(0, 2).map((t, tidx) => (
                            <span key={tidx} className="text-[8.5px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-medium truncate max-w-[80px]">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL 1: ADD NEW PROMPT */}
      {showAddPromptModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl border border-gray-100 animate-scale-in">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#1E824C]/10 text-[#1E824C] flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 font-display">Add Inspiration Prompt</h3>
              </div>
              <button
                onClick={() => setShowAddPromptModal(false)}
                className="text-gray-400 hover:text-slate-800 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPrompt} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Prompt Description / Instructions</label>
                <p className="text-[11px] text-gray-500">
                  Paste full prompt text specifying lighting, color composition, typography styling, or aesthetic guidelines:
                </p>
                <textarea
                  value={newPromptText}
                  onChange={(e) => setNewPromptText(e.target.value)}
                  placeholder="e.g. A sophisticated seasonal flyer for [occasion] featuring warm terracotta gradients, elegant serif typography, clean grid layout, and subtle organic botanicals..."
                  rows={6}
                  required
                  className="w-full p-3 bg-slate-50 border border-gray-300 rounded-xl text-xs font-mono text-slate-800 outline-none focus:border-[#1E824C] focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddPromptModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1E824C] hover:bg-[#155A34] text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  Save Prompt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PREVIEW IMAGE ZOOM */}
      {previewImageModal && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={() => setPreviewImageModal(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-slate-950 flex items-center justify-center max-h-[60vh] overflow-hidden p-4">
              <img
                src={previewImageModal.imageUrl}
                alt={previewImageModal.title}
                className="max-h-[55vh] object-contain rounded-xl shadow-lg"
              />
              <button
                onClick={() => setPreviewImageModal(null)}
                className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-3 bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono font-bold bg-[#1E824C]/10 text-[#1E824C] px-2 py-0.5 rounded uppercase">
                    {previewImageModal.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{previewImageModal.title}</h3>
                </div>
                <div className="text-[11px] text-gray-400 font-mono">
                  {new Date(previewImageModal.dateAdded).toLocaleDateString()}
                </div>
              </div>

              {previewImageModal.notes && (
                <p className="text-xs text-gray-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                  {previewImageModal.notes}
                </p>
              )}

              <div className="flex justify-between items-center pt-2 border-t text-xs">
                <span className="text-gray-400 font-mono">{previewImageModal.imageUrl}</span>
                <button
                  onClick={() => {
                    const ref = previewImageModal;
                    setPreviewImageModal(null);
                    setEditingRefModal(ref);
                  }}
                  className="text-[#1E824C] font-bold hover:underline flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Metadata</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: EDIT REFERENCE METADATA */}
      {editingRefModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-gray-100 animate-scale-in">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-slate-900 font-display">Edit Poster Details</h3>
              <button onClick={() => setEditingRefModal(null)} className="text-gray-400 hover:text-slate-800 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateReference} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Title / Label</label>
                <input
                  type="text"
                  value={editingRefModal.title}
                  onChange={(e) => setEditingRefModal({ ...editingRefModal, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs text-slate-800 outline-none focus:border-[#1E824C]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                <select
                  value={editingRefModal.category}
                  onChange={(e) => setEditingRefModal({ ...editingRefModal, category: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs text-slate-800 outline-none focus:border-[#1E824C]"
                >
                  {CATEGORIES.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Style Notes / Composition Advice</label>
                <textarea
                  value={editingRefModal.notes || ''}
                  onChange={(e) => setEditingRefModal({ ...editingRefModal, notes: e.target.value })}
                  placeholder="e.g. Minimalist layout with centered heading, subtle floral framing, high negative space"
                  rows={3}
                  className="w-full p-2.5 bg-slate-50 border border-gray-300 rounded-xl text-xs text-slate-800 outline-none focus:border-[#1E824C]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setEditingRefModal(null)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1E824C] text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
