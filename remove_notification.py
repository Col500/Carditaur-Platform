import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

target = r"\{upcomingEventNotification && \([\s\S]*?Don't add pictures\n                            </button>\n                        </div>\n                    </div>\n                \)\}"

text = re.sub(target, "", text)

with open('src/App.tsx', 'w') as f:
    f.write(text)
print("Removed notification banner")
