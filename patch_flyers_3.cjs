const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /\{flyerOverlay === "styling" && \([\s\S]*?\{flyerOverlay === "studio" && \(/;

const studioOverlay = `                            {flyerOverlay === "studio" && (
                              <div className="fixed inset-0 z-[200] bg-[#fafafa] flex flex-col items-center justify-start overflow-hidden">
                                {/* Header */}
                                <div className="w-full bg-white shadow-sm flex items-center justify-between px-6 py-4 z-10 shrink-0">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center">
                                      <Palette className="w-4 h-4 text-rose-500" />
                                    </div>
                                    <h3 className="font-display font-bold text-xl text-charcoal">Flyer Studio</h3>
                                  </div>
                                  <div className="flex items-center gap-4">
                                     <button
                                        onClick={() => {
                                          if (generatedFlyers.length === 0 && selectedOccasionId) {
                                            handleGenerateCampaign();
                                          }
                                        }}
                                        className="px-6 py-2.5 bg-charcoal text-white font-bold text-sm rounded-xl hover:bg-black transition-all disabled:opacity-50"
                                        disabled={loading || !selectedOccasionId}
                                      >
                                        {loading ? "Generating..." : "Generate Flyers"}
                                      </button>
                                     <button onClick={() => setFlyerOverlay(null)} className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition-all">
                                       <X className="w-6 h-6" />
                                     </button>
                                  </div>
                                </div>

                                {/* Main Studio Content */}
                                <div className="flex-1 w-full h-full relative overflow-hidden flex items-center justify-center p-4">
                                   {loading ? (
                                      <div className="flex flex-col items-center justify-center space-y-6">
                                        <div className="relative w-20 h-20 flex items-center justify-center">
                                          <div className="absolute inset-0 rounded-full border-4 border-gray-200 animate-pulse"></div>
                                          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-rose-500 animate-spin"></div>
                                          <span className="text-gray-800 text-sm font-mono font-black">{flyerProgressPercent}%</span>
                                        </div>
                                        <div className="space-y-2 text-center">
                                          <h4 className="font-bold text-charcoal">Generating 3 Diverse Flyers</h4>
                                          <p className="text-sm text-gray-500">{loadingPhase}</p>
                                        </div>
                                      </div>
                                   ) : generatedFlyers.length > 0 ? (
                                      <div className="w-full max-w-4xl h-full flex flex-col items-center justify-center relative">
                                         
                                         {/* Carousel Arrows */}
                                         {currentFlyerIndex > 0 && (
                                           <button onClick={() => setCurrentFlyerIndex(prev => prev - 1)} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-charcoal hover:bg-gray-50 transition-all">
                                             <span className="text-xl font-bold">←</span>
                                           </button>
                                         )}
                                         {currentFlyerIndex < generatedFlyers.length - 1 && (
                                           <button onClick={() => setCurrentFlyerIndex(prev => prev + 1)} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-charcoal hover:bg-gray-50 transition-all">
                                             <span className="text-xl font-bold">→</span>
                                           </button>
                                         )}

                                         {/* The Flyer */}
                                         <div className="w-full h-[80%] max-h-[800px] flex justify-center items-center relative group">
                                           {generatedFlyers[currentFlyerIndex].isHTMLFallback ? (
                                              <iframe
                                                title="Flyer preview"
                                                src={generatedFlyers[currentFlyerIndex].imageUrl}
                                                className="h-full border border-gray-200 shadow-xl bg-white rounded-2xl"
                                                style={{ aspectRatio: \`\${selectedWidth} / \${selectedHeight}\` }}
                                                sandbox="allow-same-origin"
                                              />
                                            ) : (
                                              <img
                                                src={generatedFlyers[currentFlyerIndex].imageUrl}
                                                alt="Flyer"
                                                className="h-full object-contain rounded-2xl shadow-xl bg-white border border-gray-200"
                                              />
                                            )}

                                            {/* Top indicators */}
                                            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2 z-10 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full">
                                               {generatedFlyers.map((_, i) => (
                                                  <div key={i} className={\`w-2 h-2 rounded-full \${i === currentFlyerIndex ? 'bg-white' : 'bg-white/40'}\`}></div>
                                               ))}
                                            </div>
                                         </div>

                                         <div className="mt-8 flex items-center gap-4">
                                            <a
                                              href={generatedFlyers[currentFlyerIndex].imageUrl}
                                              download
                                              className="px-6 py-3 bg-[#1E824C] hover:bg-[#15643A] text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
                                            >
                                              <Download className="w-4 h-4" /> Download 
                                            </a>
                                            <button
                                              onClick={() => setIsFeedbackOpen(!isFeedbackOpen)}
                                              className="px-6 py-3 bg-white text-charcoal font-bold rounded-xl shadow-md transition-all border border-gray-200 hover:bg-gray-50 flex items-center gap-2"
                                            >
                                              <MessageSquare className="w-4 h-4" /> Give Feedback
                                            </button>
                                         </div>
                                      </div>
                                   ) : (
                                      <div className="text-center space-y-4 max-w-sm">
                                        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                          <Sparkles className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-xl font-display font-bold text-charcoal">Studio Ready</h3>
                                        <p className="text-gray-500 font-sans text-sm">Hit generate to create 3 unique diverse variations for the selected occasion.</p>
                                        <button
                                          onClick={() => {
                                            if (!selectedOccasionId) {
                                               showToast("Please select an event first", "info");
                                               return;
                                            }
                                            handleGenerateCampaign();
                                          }}
                                          className="w-full py-3 bg-charcoal hover:bg-black text-white font-bold rounded-xl shadow-md transition-all mt-4"
                                        >
                                          Generate Flyers
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
                                          <MessageSquare className="w-4 h-4 text-[#1E824C]" /> Algorithm Feedback
                                        </h3>
                                        <button onClick={() => setIsFeedbackOpen(false)} className="p-1 hover:bg-gray-200 rounded-full">
                                          <X className="w-4 h-4 text-gray-500" />
                                        </button>
                                      </div>
                                      <div className="flex-1 p-4 overflow-y-auto space-y-4">
                                        <p className="text-xs text-gray-500 leading-relaxed">
                                          Chat and refine the algorithm. Let us know what you'd like improved in this specific flyer variant. Your feedback is sent directly to the developer for continuous reinforcement learning.
                                        </p>
                                        <textarea
                                          value={feedbackText}
                                          onChange={e => setFeedbackText(e.target.value)}
                                          placeholder="Type your insights here..."
                                          className="w-full h-32 p-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E824C]/20 focus:border-[#1E824C] resize-none"
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
                                          className="w-full py-2.5 bg-[#1E824C] text-white font-bold text-xs rounded-xl hover:bg-[#15643A] transition-all"
                                        >
                                          Send Feedback
                                        </button>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>

                              </div>
                            )}
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            )}
`;

const startIndex = content.indexOf('{flyerOverlay === "styling" && (');
const endIndex = content.indexOf('{/* Feature 3: Custom Milestones Screen */}');

if (startIndex !== -1 && endIndex !== -1) {
   content = content.substring(0, startIndex) + studioOverlay + "\n            " + content.substring(endIndex);
   // Need to also clean up lg:col-span-12 inside flyers so it takes full width without right column
   content = content.replace(/className="lg:col-span-5 space-y-6"/, 'className="lg:col-span-12 space-y-6 max-w-3xl mx-auto w-full"');
   fs.writeFileSync('src/App.tsx', content);
   console.log('Done patch 3');
} else {
   console.log('Could not find indices!');
}
