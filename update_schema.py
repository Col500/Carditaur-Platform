import re

with open('server.ts', 'r') as f:
    text = f.read()

target = "type: 'birthday' | 'anniversary' | 'other'; notes?: string; isAnnual?: boolean"
replacement = "type: 'birthday' | 'anniversary' | 'other'; notes?: string; isAnnual?: boolean; personImages?: string[]; optOutImages?: boolean"

text = text.replace(target, replacement)

with open('server.ts', 'w') as f:
    f.write(text)

print("Schema updated in server.ts")
