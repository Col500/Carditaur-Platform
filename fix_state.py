import re

with open('src/components/AdminFlyers.tsx', 'r') as f:
    text = f.read()

text = text.replace("const [activeToolMenu, setActiveToolMenu] = useState<'main' | 'text' | 'shapes'>('main');", "const [activeToolMenu, setActiveToolMenu] = useState<'main' | 'text' | 'shapes' | 'logo' | 'addons'>('main');")
text = text.replace("const [activeToolMenu, setActiveToolMenu] = useState<'main' | 'text' | 'shapes' | 'logo'>('main');", "const [activeToolMenu, setActiveToolMenu] = useState<'main' | 'text' | 'shapes' | 'logo' | 'addons'>('main');")

new_states = """  const [activeToolMenu, setActiveToolMenu] = useState<'main' | 'text' | 'shapes' | 'logo' | 'addons'>('main');
  const [addonType, setAddonType] = useState<'none' | 'header' | 'footer' | 'left' | 'right'>('none');
  const [addonColor, setAddonColor] = useState<string>('#1E824C');
  const [addonThickness, setAddonThickness] = useState<number>(100);"""

text = text.replace("const [activeToolMenu, setActiveToolMenu] = useState<'main' | 'text' | 'shapes' | 'logo' | 'addons'>('main');", new_states)

with open('src/components/AdminFlyers.tsx', 'w') as f:
    f.write(text)
print("Updated states")
