import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

target = """    type: "birthday" | "anniversary" | "other";
    notes?: string;
  }[];"""

replacement = """    type: "birthday" | "anniversary" | "other";
    notes?: string;
    isAnnual?: boolean;
    personImages?: string[];
    optOutImages?: boolean;
  }[];"""

text = text.replace(target, replacement)

with open('src/App.tsx', 'w') as f:
    f.write(text)
print("Updated interface")
