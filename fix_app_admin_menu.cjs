const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Change initial state of adminTab to 'menu'
code = code.replace(/const \[adminTab, setAdminTab\] = useState<'flyers' \| 'settings'>\('flyers'\);/, 
  "const [adminTab, setAdminTab] = useState<'menu' | 'flyers' | 'settings'>('menu');");

// 2. Change the Modal wrapper for adminTab === 'flyers' so it has no padding and takes full screen
code = code.replace(/className="bg-white w-full h-full sm:rounded-\[2rem\] sm:p-6 sm:max-w-6xl sm:shadow-2xl relative sm:h-\[90vh\] overflow-hidden flex flex-col p-4"/, 
  "className={`bg-white w-full h-full relative overflow-hidden flex flex-col ${adminTab === 'flyers' ? '' : 'sm:rounded-[2rem] sm:p-6 sm:max-w-6xl sm:shadow-2xl sm:h-[90vh] p-4'}`}");

// 3. Remove the close button (X) when in flyers view, as they have a 'Back' button there, or keep it but hide it.
code = code.replace(/<button\s*onClick=\{\(\) => setShowAdminPanel\(false\)\}\s*className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-full text-slate-800 transition-all"\s*>\s*<X className="w-4 h-4" \/>\s*<\/button>/, 
  `{adminTab !== 'flyers' && (<button
                onClick={() => setShowAdminPanel(false)}
                className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-full text-slate-800 transition-all"
              >
                <X className="w-4 h-4" />
              </button>)}`);

// 4. Wrap the headers in adminTab !== 'flyers' check so the header is hidden in flyers view
code = code.replace(/<div className="w-full h-full flex flex-col">\s*<div className="border-b pb-4 mb-4">\s*<h2 className="text-xl font-display font-bold text-charcoal">Admin Dashboard<\/h2>\s*<p className="text-xs text-gray-500">Manage settings, templates, and review AI-generated flyers\.<\/p>\s*<\/div>\s*<div className="flex-1 overflow-hidden flex flex-col">\s*<div className="mb-4 flex space-x-4">\s*<button onClick=\{\(\) => setAdminTab\('flyers'\)\}.*?<\/button>\s*<button onClick=\{\(\) => setAdminTab\('settings'\)\}.*?<\/button>\s*<\/div>/s, 
  `<div className="w-full h-full flex flex-col">
                {adminTab !== 'flyers' && (
                  <>
                    <div className="border-b pb-4 mb-4">
                      <h2 className="text-xl font-display font-bold text-charcoal">Admin Dashboard</h2>
                      <p className="text-xs text-gray-500">Manage settings, templates, and review AI-generated flyers.</p>
                    </div>
                    {adminTab !== 'menu' && (
                      <div className="mb-4 flex space-x-4">
                        <button onClick={() => setAdminTab('menu')} className="px-4 py-2 text-xs font-bold rounded-lg bg-gray-100 hover:bg-gray-200">← Back</button>
                        <button onClick={() => setAdminTab('settings')} className="px-4 py-2 text-xs font-bold rounded-lg bg-charcoal text-white">API Settings</button>
                      </div>
                    )}
                  </>
                )}
                
                <div className="flex-1 overflow-hidden flex flex-col">`);

// 5. Update the conditional rendering to include 'menu'
code = code.replace(/\{adminTab === 'flyers' \? \(\s*<AdminFlyers \/>\s*\) : \(/,
  `{adminTab === 'menu' ? (
                      <div className="flex flex-col items-center justify-center h-full space-y-6">
                          <button onClick={() => setAdminTab('settings')} className="w-full max-w-sm p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col items-center">
                              <span className="text-lg font-bold text-charcoal mb-2">API Backend</span>
                              <span className="text-xs text-gray-500 text-center">Configure external APIs and system settings</span>
                          </button>
                          <button onClick={() => setAdminTab('flyers')} className="w-full max-w-sm p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col items-center">
                              <span className="text-lg font-bold text-[#1E824C] mb-2">Studio Editor</span>
                              <span className="text-xs text-gray-500 text-center">Review, edit, and approve AI-generated flyers</span>
                          </button>
                      </div>
                   ) : adminTab === 'flyers' ? (
                        <AdminFlyers onClose={() => setAdminTab('menu')} />
                   ) : (`);

fs.writeFileSync('src/App.tsx', code);
