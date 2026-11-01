import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

target = """            {activeFeature === "home" && (
              <div className="space-y-6 animate-fade-in flex flex-col w-full text-left">
                {/* Single line showing closest upcoming event"""

replacement = """            {activeFeature === "home" && (
              <div className="space-y-6 animate-fade-in flex flex-col w-full text-left">
                {upcomingEventNotification && (
                    <div className="bg-[#1E824C]/10 border border-[#1E824C]/30 rounded-2xl p-6 mb-6 flex flex-col md:flex-row gap-6 items-start md:items-center relative">
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-charcoal mb-1">
                                Upcoming Event: {upcomingEventNotification.event.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                                This event is {upcomingEventNotification.days === 0 ? "today" : `in ${upcomingEventNotification.days} days`}! Add 3-4 pictures of the person so they can be included in the flyer design.
                            </p>
                            <a href="#" className="text-xs text-blue-600 underline block mt-2" onClick={(e) => { e.preventDefault(); alert("Tips: Look at their social media or ask close friends non-intrusively for high quality headshots or pictures. Ensure good lighting and a clear view of their face."); }}>
                                Tips on how to get images
                            </a>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <label className="px-4 py-2 bg-charcoal text-white rounded-lg text-sm font-bold cursor-pointer hover:bg-gray-800 transition-colors text-center shadow-sm">
                                Upload Pictures
                                <input type="file" multiple accept="image/*" className="hidden" onChange={async (e) => {
                                    if (!e.target.files?.length) return;
                                    const files = Array.from(e.target.files).slice(0, 4);
                                    const base64s = [];
                                    for (const f of files) {
                                        const reader = new FileReader();
                                        await new Promise((resolve) => {
                                            reader.onload = (ev) => {
                                                base64s.push(ev.target.result);
                                                resolve();
                                            };
                                            reader.readAsDataURL(f);
                                        });
                                    }
                                    const updatedBiz = { ...upcomingEventNotification.business };
                                    updatedBiz.customEvents = updatedBiz.customEvents.map(evt => 
                                        evt.id === upcomingEventNotification.event.id ? { ...evt, personImages: base64s } : evt
                                    );
                                    await fetch(`/api/businesses/${updatedBiz.id}`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(updatedBiz)
                                    });
                                    setBusinesses(businesses.map(b => b.id === updatedBiz.id ? updatedBiz : b));
                                }} />
                            </label>
                            <button className="px-4 py-2 border border-gray-300 text-charcoal rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm" onClick={async () => {
                                const updatedBiz = { ...upcomingEventNotification.business };
                                updatedBiz.customEvents = updatedBiz.customEvents.map(evt => 
                                    evt.id === upcomingEventNotification.event.id ? { ...evt, optOutImages: true } : evt
                                );
                                await fetch(`/api/businesses/${updatedBiz.id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(updatedBiz)
                                });
                                setBusinesses(businesses.map(b => b.id === updatedBiz.id ? updatedBiz : b));
                            }}>
                                Don't add pictures
                            </button>
                        </div>
                    </div>
                )}
                {/* Single line showing closest upcoming event"""

text = text.replace(target, replacement)

with open('src/App.tsx', 'w') as f:
    f.write(text)
print("Added notification banner")
