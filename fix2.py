import re
with open('src/components/AdminFlyers.tsx', 'r') as f:
    content = f.read()

# Fix the JSX wrapper
content = re.sub(r'\{/\* Bottom Scrollable Navigation Toolbar \*/\}.*?\{!activeObj && \(', '{/* Bottom Scrollable Navigation Toolbar */}\n      {!activeObj && (', content, flags=re.DOTALL)

# Let's just find the last "</div>" inside the component and close it properly
if '{!activeObj && (' in content and ')}' not in content.split('{!activeObj && (')[1]:
    # We need to append )} before the last 3 closing divs
    parts = content.rsplit('</div>', 3)
    content = parts[0] + '</div>\n      )}' + '</div>'.join(parts[1:])

with open('src/components/AdminFlyers.tsx', 'w') as f:
    f.write(content)
