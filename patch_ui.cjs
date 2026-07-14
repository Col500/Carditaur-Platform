const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace default size preset
content = content.replace(/const \[sizePreset, setSizePreset\] = useState<string>\("instagram-square"\);/, 'const [sizePreset, setSizePreset] = useState<string>("auto-diverse");');

// We need to inject hide-scrollbar utility in css
let css = fs.readFileSync('src/index.css', 'utf8');
if (!css.includes('.hide-scrollbar')) {
  css += `\n\n@layer utilities {\n  .hide-scrollbar::-webkit-scrollbar {\n    display: none;\n  }\n  .hide-scrollbar {\n    -ms-overflow-style: none;\n    scrollbar-width: none;\n  }\n}\n`;
  fs.writeFileSync('src/index.css', css);
}

const overlayStart = '{flyerOverlay === "studio" && (';
const overlayEnd = ' {/* Feature 3: Custom Milestones Screen */}';

const newOverlay = `                            {flyerOverlay === "studio" && (
                              <div className="fixed inset-0 z-[200] bg-[#fafafa] flex flex-col items-center justify-start overflow-hidden font-sans">
                                {/* Header - Thinner, Minimalist */}
                                <div className="w-full bg-white border-b border-gray-100 flex items-center justify-between px-6 py-2.5 z-10 shrink-0">
                                  <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded bg-[#39FF14]/10 flex items-center justify-center border border-[#39FF14]/20">
                                      <Palette className="w-3.5 h-3.5 text-[#39FF14]" />
                                    </div>
                                    <h3 className="font-display font-bold text-lg text-charcoal tracking-tight">Flyer Studio</h3>
                                  </div>
                                  
                                  <div className="flex items-center gap-4">
                                     <select
                                        value={sizePreset}
                                        onChange={(e) => {
                                          setSizePreset(e.target.value);
                                          if (e.target.value === "instagram-square") { setSelectedWidth(1080); setSelectedHeight(1080); }
                                          else if (e.target.value === "instagram-portrait") { setSelectedWidth(1080); setSelectedHeight(1350); }
                                          else if (e.target.value === "instagram-story") { setSelectedWidth(1080); setSelectedHeight(1920); }
                                          else if (e.target.value === "landscape-banner") { setSelectedWidth(1200); setSelectedHeight(630); }
                                        }}
                                        className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 font-medium text-charcoal outline-none focus:border-[#39FF14]"
                                      >
                                        <option value="auto-diverse">Diverse Sizes (Auto)</option>
                                        <option value="instagram-square">Instagram Square (1:1)</option>
                                        <option value="instagram-portrait">Instagram Portrait (4:5)</option>
                                        <option value="instagram-story">Instagram Story (9:16)</option>
                                        <option value="landscape-banner">Landscape Web</option>
                                      </select>
                                      
                                     <button
                                        onClick={() => {
                                          if (selectedOccasionId) handleGenerateCampaign();
                                        }}
                                        className="px-5 py-1.5 bg-black text-[#39FF14] font-bold text-xs rounded-lg hover:bg-gray-900 transition-all disabled:opacity-50 border border-black"
                                        disabled={loading || !selectedOccasionId}
                                      >
                                        {loading ? "Generating..." : "Generate Flyers"}
                                      </button>
                                     <button onClick={() => setFlyerOverlay(null)} className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-all">
                                       <X className="w-5 h-5" />
                                     </button>
                                  </div>
                                </div>

                                {/* Main Studio Content */}
                                <div className="flex-1 w-full h-full relative overflow-hidden flex flex-col items-center justify-center p-4">
                                   {loading ? (
                                      <div className="flex flex-col items-center justify-center space-y-6">
                                        <div className="relative w-16 h-16 flex items-center justify-center">
                                          <div className="absolute inset-0 rounded-full border-[3px] border-gray-100 animate-pulse"></div>
                                          <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#39FF14] animate-spin"></div>
                                          <span className="text-charcoal text-xs font-mono font-black">{flyerProgressPercent}%</span>
                                        </div>
                                        <div className="space-y-1.5 text-center">
                                          <h4 className="font-bold text-sm text-charcoal">Synthesizing Diverse Flyers</h4>
                                          <p className="text-xs text-gray-500">{loadingPhase}</p>
                                        </div>
                                      </div>
                                   ) : generatedFlyers.length > 0 ? (
                                      <div className="w-full h-full max-w-5xl flex flex-col items-center pt-2 relative">
                                         
                                         {/* Top indicators */}
                                         <div className="flex gap-2 justify-center mb-6">
                                            {generatedFlyers.map((_, i) => (
                                                <button key={i} onClick={() => {
                                                   const el = document.getElementById('carousel_scroll_container');
                                                   if (el) el.scrollTo({ left: el.offsetWidth * i, behavior: 'smooth' });
                                                   setCurrentFlyerIndex(i);
                                                }} className={\`w-10 h-1.5 rounded-full transition-colors \${i === currentFlyerIndex ? 'bg-[#39FF14]' : 'bg-gray-200 hover:bg-gray-300'}\`}></button>
                                            ))}
                                            <button key="gif" onClick={() => {
                                                   const el = document.getElementById('carousel_scroll_container');
                                                   if (el) el.scrollTo({ left: el.offsetWidth * generatedFlyers.length, behavior: 'smooth' });
                                                   setCurrentFlyerIndex(generatedFlyers.length);
                                            }} className={\`w-10 h-1.5 rounded-full transition-colors \${generatedFlyers.length === currentFlyerIndex ? 'bg-[#39FF14]' : 'bg-gray-200 hover:bg-gray-300'}\`}></button>
                                         </div>

                                         {/* Carousel Swipeable Container */}
                                         <div 
                                           id="carousel_scroll_container"
                                           className="w-full flex-1 flex overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8" 
                                           onScroll={(e) => {
                                              const target = e.target;
                                              const index = Math.round(target.scrollLeft / target.offsetWidth);
                                              setCurrentFlyerIndex(index);
                                           }}
                                         >
                                            {generatedFlyers.map((flyer, i) => (
                                                <div key={i} className="min-w-full h-full flex flex-col justify-center items-center snap-center px-4">
                                                   <div className="relative h-full flex flex-col justify-center items-center">
                                                     {flyer.isHTMLFallback ? (
                                                       <iframe
                                                         title="Flyer preview"
                                                         src={flyer.imageUrl}
                                                         className="max-w-full max-h-[100%] border border-gray-200 shadow-xl bg-white rounded-2xl"
                                                         style={{ aspectRatio: \`\${flyer.flyerData?.width || selectedWidth} / \${flyer.flyerData?.height || selectedHeight}\`, height: '100%' }}
                                                         sandbox="allow-same-origin"
                                                       />
                                                     ) : (
                                                       <img
                                                         src={flyer.imageUrl}
                                                         alt="Flyer"
                                                         className="max-w-full max-h-[100%] object-contain rounded-2xl shadow-xl bg-white border border-gray-200"
                                                       />
                                                     )}
                                                     
                                                     <div className="mt-6">
                                                        <a
                                                          href={flyer.imageUrl}
                                                          download
                                                          className="px-6 py-2.5 bg-black hover:bg-gray-900 text-[#39FF14] font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 border border-black"
                                                        >
                                                          <Download className="w-4 h-4" /> Download 
                                                        </a>
                                                     </div>
                                                   </div>
                                                </div>
                                            ))}
                                            
                                            {/* Blank GIF Page */}
                                            <div key="gif" className="min-w-full h-full flex flex-col justify-center items-center snap-center px-4">
                                                <div className="w-full max-w-sm aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-gray-400 p-8 text-center shadow-inner">
                                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300">
                                                       <Sparkles className="w-6 h-6" />
                                                    </div>
                                                    <span className="font-display font-bold text-xl text-charcoal mb-2">Animated GIF</span>
                                                    <span className="text-sm">We're preparing your motion graphics. This feature will be available shortly.</span>
                                                </div>
                                            </div>
                                         </div>

                                         {/* Floating Feedback Icon at the side of the screen */}
                                         <button
                                            onClick={() => setIsFeedbackOpen(!isFeedbackOpen)}
                                            className="fixed right-6 bottom-6 z-50 w-14 h-14 bg-black rounded-full shadow-2xl border border-gray-800 flex items-center justify-center text-[#39FF14] hover:scale-105 transition-transform"
                                            title="Give Feedback"
                                         >
                                            <MessageSquare className="w-5 h-5" />
                                         </button>
                                      </div>
                                   ) : (
                                      <div className="text-center space-y-3 max-w-sm">
                                        <div className="w-14 h-14 bg-black text-[#39FF14] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#39FF14]/20">
                                          <Sparkles className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-xl font-display font-bold text-charcoal tracking-tight">Studio Ready</h3>
                                        <p className="text-gray-500 font-sans text-xs leading-relaxed">Hit generate to create a diverse batch of 3 unique flyers + 1 animated GIF for the selected occasion.</p>
                                        <button
                                          onClick={() => {
                                            if (!selectedOccasionId) {
                                               showToast("Please select an event first", "info");
                                               return;
                                            }
                                            handleGenerateCampaign();
                                          }}
                                          className="w-full py-2.5 bg-black hover:bg-gray-900 text-[#39FF14] font-bold text-sm rounded-xl shadow-md transition-all mt-4 border border-black"
                                        >
                                          Generate Batch
                                        </button>
                                      </div>
                                   )}
                                </div>

                                {/* Feedback Sliding Panel */}
                                <AnimatePresence>
                                  {isFeedbackOpen && (
                                    <motion.div
                                      initial={{ x: '100%', opacity: 0 }}
                                      animate={{ x: 0, opacity: 1 }}
                                      exit={{ x: '100%', opacity: 0 }}
                                      className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl border-l border-gray-100 flex flex-col z-[300]"
                                    >
                                      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                        <h3 className="font-bold text-sm text-charcoal flex items-center gap-2">
                                          <MessageSquare className="w-4 h-4 text-[#39FF14]" /> Algorithm Feedback
                                        </h3>
                                        <button onClick={() => setIsFeedbackOpen(false)} className="p-1 hover:bg-gray-200 rounded-full transition-all">
                                          <X className="w-4 h-4 text-gray-500" />
                                        </button>
                                      </div>
                                      <div className="flex-1 p-4 overflow-y-auto space-y-4">
                                        <p className="text-xs text-gray-500 leading-relaxed">
                                          Chat and refine the algorithm. Let us know what you'd like improved in this specific variant. Your feedback is sent directly to the developer.
                                        </p>
                                        <textarea
                                          value={feedbackText}
                                          onChange={e => setFeedbackText(e.target.value)}
                                          placeholder="Type your insights here..."
                                          className="w-full h-32 p-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#39FF14] focus:border-[#39FF14] resize-none"
                                        />
                                        <button
                                          onClick={async () => {
                                            if(!feedbackText.trim()) return;
                                            try {
                                              await fetch('/api/feedback', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                  businessId: selectedBusinessId,
                                                  feedback: feedbackText,
                                                  flyerId: generatedFlyers[currentFlyerIndex]?.imageUrl
                                                })
                                              });
                                              showToast("Feedback sent to developers!", "success");
                                              setFeedbackText("");
                                              setIsFeedbackOpen(false);
                                            } catch (e) {
                                              showToast("Failed to send feedback", "error");
                                            }
                                          }}
                                          className="w-full py-2.5 bg-black text-[#39FF14] font-bold text-xs rounded-xl hover:bg-gray-900 transition-all border border-black"
                                        >
                                          Submit Feedback
                                        </button>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>

                              </div>
                            )}
`;

const startIndex = content.indexOf('{flyerOverlay === "studio" && (');
const endIndexStr = '{/* Feature 3: Custom Milestones Screen */}';
const endIndex = content.indexOf(endIndexStr);

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + newOverlay + "\n                          " + content.substring(endIndex);
  
  // Need to also inject sizePreset into handleGenerateCampaign if it's there
  content = content.replace(/body: JSON\.stringify\(\{\s*businessId/g, 'body: JSON.stringify({\n          sizePreset,\n          businessId');
  
  fs.writeFileSync('src/App.tsx', content);
  console.log("Rewritten UI successfully");
} else {
  console.log("Failed to locate indexes");
}
