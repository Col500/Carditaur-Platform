const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacement = `                  {/* STEP 3: Custom Milestone Celebrations (Birthdays, Anniversaries) */}
                  {addBizStep === 3 && (
                    <div className="space-y-6 py-2 animate-fade-in text-left flex flex-col justify-start overflow-y-auto flex-1 min-h-0">
                      <div>
                        <span className="block text-xs font-bold text-[#39FF14] uppercase tracking-wider mb-1 bg-black w-fit px-2 py-0.5 rounded-md">
                          Custom Non-Occasions
                        </span>
                        <p className="text-xs text-gray-500 mt-2 mb-3 font-sans leading-relaxed">
                          Engage common business milestones by simply selecting a date. Or add your own custom occasions.
                        </p>
                      </div>

                      {/* Ready-to-engage pre-defined events grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                         {["Company Anniversary", "Business Founder's Day", "Employee Work Anniversary", "Employee Appreciation Day", "Product Launch Anniversary", "Branch Opening Anniversary", "Partner Appreciation Day", "Supplier Appreciation Day", "Client Success Appreciation"].map((suggestedName, i) => (
                             <div key={i} className="bg-white border border-border-gray hover:border-[#39FF14] p-3 rounded-xl shadow-sm flex flex-col justify-between transition-colors">
                                 <div className="text-[11px] font-bold text-charcoal mb-2 leading-tight">{suggestedName}</div>
                                 <div className="flex items-center gap-2 mt-auto">
                                     <input 
                                        type="date" 
                                        className="w-full text-[10px] p-1.5 border border-gray-200 rounded-md focus:ring-1 focus:ring-[#39FF14] focus:outline-none text-gray-600"
                                        onChange={(e) => {
                                           if (e.target.value) {
                                              const parts = e.target.value.split("-");
                                              const dateStr = parts.length === 3 ? \`\${parts[1]}-\${parts[2]}\` : e.target.value;
                                              const exists = newCustomEvents.find(ev => ev.name === suggestedName);
                                              if (exists) {
                                                setNewCustomEvents(prev => prev.map(ev => ev.name === suggestedName ? { ...ev, date: dateStr } : ev));
                                              } else {
                                                setNewCustomEvents(prev => [...prev, {
                                                  id: 'cus_' + Math.random().toString(36).substr(2, 9),
                                                  name: suggestedName,
                                                  date: dateStr,
                                                  type: "other",
                                                  notes: "",
                                                  isAnnual: true
                                                }]);
                                              }
                                              showToast(\`\${suggestedName} engaged!\`, 'success');
                                           }
                                        }}
                                        value={(() => {
                                            const matching = newCustomEvents.find(ev => ev.name === suggestedName);
                                            if (!matching || !matching.date) return "";
                                            // Format back to YYYY-MM-DD for date input
                                            return \`\${new Date().getFullYear()}-\${matching.date}\`;
                                        })()}
                                     />
                                 </div>
                             </div>
                         ))}
                      </div>

                      <div className="border-t border-gray-100 pt-5 mt-4">
                        <span className="block text-xs font-bold text-charcoal mb-3">Or create an entirely custom milestone</span>
                        {/* Milestone details entering - Flat Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 py-3 px-4 bg-gray-50 rounded-2xl border border-border-gray shrink-0">
                          <div className="sm:col-span-4">
                            <label
                              htmlFor="milestone_name"
                              className="block text-[10px] font-bold text-gray-500 uppercase mb-1"
                            >
                              Event Name
                            </label>
                            <input
                              id="milestone_name"
                              type="text"
                              placeholder="e.g. John's Birthday, Anniversary"
                              value={tempEventName}
                              onChange={(e) => setTempEventName(e.target.value)}
                              className="block w-full px-3 py-2 bg-white border border-border-gray rounded-xl text-xs font-sans text-charcoal focus:outline-none focus:ring-1 focus:ring-[#39FF14]"
                            />
                          </div>

                          <div className="sm:col-span-3">
                            <label
                              htmlFor="milestone_date"
                              className="block text-[10px] font-bold text-gray-500 uppercase mb-1"
                            >
                              Date
                            </label>
                            <input
                              id="milestone_date"
                              type="date"
                              value={tempEventDate}
                              onChange={(e) => setTempEventDate(e.target.value)}
                              className="block w-full px-2 py-2 bg-white border border-border-gray rounded-xl text-xs font-sans text-[#444] focus:outline-none focus:ring-1 focus:ring-[#39FF14]"
                            />
                          </div>

                          <div className="sm:col-span-3">
                            <label
                              htmlFor="milestone_type"
                              className="block text-[10px] font-bold text-gray-500 uppercase mb-1"
                            >
                              Type
                            </label>
                            <select
                              id="milestone_type"
                              value={tempEventType}
                              onChange={(e) =>
                                setTempEventType(
                                  e.target.value as
                                    | "birthday"
                                    | "anniversary"
                                    | "other",
                                )
                              }
                              className="block w-full px-2 py-2 bg-white border border-border-gray rounded-xl text-xs font-sans text-[#444] focus:outline-none focus:ring-1 focus:ring-[#39FF14]"
                            >
                              <option value="birthday">Birthday</option>
                              <option value="anniversary">Anniversary</option>
                              <option value="other">
                                Other
                              </option>
                            </select>
                          </div>

                          <div className="sm:col-span-2 flex items-end">
                            <button
                              type="button"
                              onClick={() => {
                                if (!tempEventName.trim()) {
                                  showToast(
                                    "Please enter custom celebration name first!",
                                    "info",
                                  );
                                  return;
                                }
                                if (!tempEventDate) {
                                  showToast(
                                    "Please specify the milestone date first!",
                                    "info",
                                  );
                                  return;
                                }
                                const parts = tempEventDate.split("-");
                                let formattedDate = tempEventDate;
                                if (parts.length === 3) {
                                  formattedDate = \`\${parts[1]}-\${parts[2]}\`;
                                }

                                if (editingEventId) {
                                  setNewCustomEvents((prev) =>
                                    prev.map((e) =>
                                      e.id === editingEventId
                                        ? {
                                            ...e,
                                            name: tempEventName,
                                            date: formattedDate,
                                            type: tempEventType,
                                            notes: tempEventNotes,
                                            isAnnual: tempEventIsAnnual,
                                          }
                                        : e,
                                    ),
                                  );
                                  setEditingEventId(null);
                                  showToast("Event updated", "success");
                                } else {
                                  setNewCustomEvents((prev) => [
                                    ...prev,
                                    {
                                      id: "cus_" + Math.random().toString(36).substr(2, 9),
                                      name: tempEventName,
                                      date: formattedDate,
                                      type: tempEventType,
                                      notes: tempEventNotes,
                                      isAnnual: tempEventIsAnnual,
                                    },
                                  ]);
                                  showToast("Event added", "success");
                                }

                                setTempEventName("");
                                setTempEventDate("");
                                setTempEventNotes("");
                                setTempEventType("birthday");
                                setTempEventIsAnnual(true);
                              }}
                              className="w-full bg-[#39FF14] text-black font-bold py-2 rounded-xl hover:opacity-90 transition-all text-xs"
                            >
                              {editingEventId ? "Save" : "Add"}
                            </button>
                          </div>
                        </div>
                      </div>`;

content = content.replace(/\{\/\* STEP 3: Custom Milestone Celebrations[\s\S]*?className="w-full bg-\[\#0076A3\].*?\n\s*\}\n\s*\{\/\* Current Custom Events List \*\/\}/g, replacement + '\n                      {/* Current Custom Events List */}');
fs.writeFileSync(file, content);
console.log('Patched Custom events');
