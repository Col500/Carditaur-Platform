import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

# find where mt-6 flex flex-row items-center gap-3 is
target = """                                                     <div className="mt-6 flex flex-row items-center gap-3" style={{ transform: `scale(${1/flyerZoom})` }}>"""

replacement = """                                                     <div className="mt-6 flex flex-col items-center gap-3" style={{ transform: `scale(${1/flyerZoom})` }}>
                                                        <div className="flex flex-row items-center gap-3">"""

text = text.replace(target, replacement)

target2 = """                                                           >
                                                              <Download className="w-4 h-4" /> Download
                                                           </button>
                                                        )}
                                                     </div>"""

replacement2 = """                                                           >
                                                              <Download className="w-4 h-4" /> Download
                                                           </button>
                                                        )}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-2 bg-white/80 px-4 py-2 rounded-full border border-gray-200 shadow-sm backdrop-blur-sm">
                                                            <span className="text-xs font-mono text-gray-500 font-medium">50%</span>
                                                            <input 
                                                                type="range" 
                                                                min="0.5" max="2.0" step="0.1" 
                                                                value={flyerZoom} 
                                                                onChange={(e) => setFlyerZoom(parseFloat(e.target.value))}
                                                                className="w-32 accent-charcoal"
                                                            />
                                                            <span className="text-xs font-mono text-gray-500 font-medium">200%</span>
                                                            <span className="text-xs font-mono text-blue-600 font-bold ml-2">{Math.round(flyerZoom * 100)}%</span>
                                                        </div>
                                                     </div>"""

text = text.replace(target2, replacement2)

with open('src/App.tsx', 'w') as f:
    f.write(text)

