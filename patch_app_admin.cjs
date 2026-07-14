const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const importAdminFlyers = `import { AdminFlyers } from './components/AdminFlyers';\n`;
if (!code.includes('AdminFlyers')) {
   code = code.replace(/import React/, importAdminFlyers + "import React");
}

const newAdminPanelContent = `className="bg-white rounded-[2rem] p-6 w-full max-w-6xl shadow-2xl relative h-[90vh] overflow-hidden flex flex-col"
            >
              <button
                onClick={() => setShowAdminPanel(false)}
                className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-full text-slate-800 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="w-full h-full flex flex-col">
                <div className="border-b pb-4 mb-4">
                  <h2 className="text-xl font-display font-bold text-charcoal">Admin Dashboard</h2>
                  <p className="text-xs text-gray-500">Manage settings, templates, and review AI-generated flyers.</p>
                </div>
                
                <div className="flex-1 overflow-hidden flex flex-col">
                   <div className="mb-4 flex space-x-4">
                     <button onClick={() => setAdminTab('flyers')} className={\`px-4 py-2 text-xs font-bold rounded-lg \${adminTab === 'flyers' ? 'bg-charcoal text-white' : 'bg-gray-100'}\`}>Review Flyers</button>
                     <button onClick={() => setAdminTab('settings')} className={\`px-4 py-2 text-xs font-bold rounded-lg \${adminTab === 'settings' ? 'bg-charcoal text-white' : 'bg-gray-100'}\`}>API Settings</button>
                   </div>
                   
                   <div className="flex-1 overflow-y-auto">
                     {adminTab === 'flyers' ? (
                        <AdminFlyers />
                     ) : (
                        <div>
                          {/* Config Settings */}
                          <div className="space-y-2 mt-4 p-4 border border-border-gray rounded-2xl bg-slate-50">
                             <div className="font-bold text-sm text-charcoal">Ideogram API Key</div>
                             <div className="text-xs text-slate-500 font-sans mb-2">Used for generating flyer background imagery via Ideogram.</div>
                             <input
                               type="text"
                               value={ideogramApiKey}
                               onChange={(e) => setIdeogramApiKey(e.target.value)}
                               className="w-full text-xs p-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#1E824C] font-mono bg-white"
                               placeholder="UseZ10RT..."
                             />
                          </div>

                          <div className="space-y-2 mt-4 p-4 border border-border-gray rounded-2xl bg-slate-50">
                             <div className="font-bold text-sm text-charcoal">DeepSeek API Key (Legacy)</div>
                             <div className="text-xs text-slate-500 font-sans mb-2">Not currently active.</div>
                             <input
                               type="text"
                               value={deepseekApiKey}
                               onChange={(e) => setDeepseekApiKey(e.target.value)}
                               className="w-full text-xs p-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#1E824C] font-mono bg-white"
                               placeholder="sk-..."
                             />
                          </div>

                          <button
                            onClick={() => {
                              fetch('/api/admin/config', {
                                 method: 'POST',
                                 headers: { 'Content-Type': 'application/json' },
                                 body: JSON.stringify({ ideogramApiKey, deepseekApiKey })
                              }).catch(console.error);
                              setShowAdminPanel(false);
                            }}
                            className="w-full font-bold bg-charcoal hover:opacity-90 text-white rounded-xl py-3 shadow-md transition-all active:scale-95 text-xs mt-6"
                          >
                            Save Settings & Close
                          </button>
                        </div>
                     )}
                   </div>
                </div>
              </div>
            </motion.div>`;

code = code.replace(/className="bg-white rounded-\[2rem\] p-6 w-full max-w-2xl shadow-2xl relative max-h-\[90vh\] overflow-y-auto"[\s\S]*?<\/motion\.div>/, newAdminPanelContent);

// Add state for adminTab
if (!code.includes('adminTab')) {
  code = code.replace(/const \[showAdminPanel, setShowAdminPanel\] = useState<boolean>\(false\);/, "const [showAdminPanel, setShowAdminPanel] = useState<boolean>(false);\n  const [adminTab, setAdminTab] = useState<'flyers' | 'settings'>('flyers');");
}

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx with Admin tab");
