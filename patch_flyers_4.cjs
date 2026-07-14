const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/<div className="mt-8 flex items-center gap-4">[\s\S]*?Give Feedback[\s\S]*?<\/button>\s*<\/div>/, `<div className="mt-8 flex items-center gap-4">
                                            <a
                                              href={generatedFlyers[currentFlyerIndex].imageUrl}
                                              download
                                              className="px-6 py-3 bg-[#1E824C] hover:bg-[#15643A] text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
                                            >
                                              <Download className="w-4 h-4" /> Download 
                                            </a>
                                         </div>
                                         
                                         {/* Floating Feedback Icon at the side of the screen */}
                                         <button
                                            onClick={() => setIsFeedbackOpen(!isFeedbackOpen)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-14 h-14 bg-white rounded-full shadow-2xl border border-gray-100 flex items-center justify-center text-[#1E824C] hover:bg-gray-50 transition-all hover:scale-105"
                                            title="Give Feedback"
                                         >
                                            <MessageSquare className="w-6 h-6" />
                                         </button>`);

fs.writeFileSync('src/App.tsx', content);
console.log('Done patch 4');
