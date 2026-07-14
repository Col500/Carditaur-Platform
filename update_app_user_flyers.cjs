const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const replacement = `
                    {bizFlyers.length === 0 ? (
                      <div className="p-8 text-center text-gray-500 font-sans text-xs">No flyers generated yet.</div>
                    ) : (
                      bizFlyers.map((flyer: any, idx: number) => (
                        <div key={idx} className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col">
                          {flyer.status === 'pending_review' ? (
                            <div className="w-full aspect-[4/5] bg-gray-100 flex flex-col items-center justify-center p-6 text-center border-b border-gray-200">
                               <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                                 <svg className="w-6 h-6 text-blue-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                 </svg>
                               </div>
                               <h3 className="font-bold text-gray-800 text-sm mb-1">Under Design</h3>
                               <p className="text-xs text-gray-500">Your flyer for {flyer.occasionName} is currently being crafted by our design team.</p>
                            </div>
                          ) : (
                            <img src={flyer.imageUrl} alt={flyer.occasionName} className="w-full aspect-[4/5] object-cover border-b border-gray-200" />
                          )}
                          <div className="p-4 bg-white flex-1 flex flex-col justify-between">
                             <div>
                               <div className="font-bold text-charcoal text-sm">{flyer.occasionName}</div>
                               <div className="text-[10px] text-gray-400 mt-1">{new Date(flyer.createdAt).toLocaleDateString()}</div>
                             </div>
                             {flyer.status !== 'pending_review' && (
                               <a href={flyer.imageUrl} download target="_blank" rel="noreferrer" className="mt-3 block text-center w-full bg-gray-100 hover:bg-gray-200 text-charcoal text-[10px] font-bold py-2 rounded-lg transition-colors">
                                 Download
                               </a>
                             )}
                          </div>
                        </div>
                      ))
                    )}
`;

code = code.replace(/\{bizFlyers\.length === 0 \? \([\s\S]*?\}\)\s*\)\}/, replacement.trim());
fs.writeFileSync('src/App.tsx', code);
console.log("Updated App.tsx User Flyer view");
