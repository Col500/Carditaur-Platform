with open('src/components/AdminFlyers.tsx', 'r') as f:
    lines = f.readlines()

# Find the start of the bottom toolbar
start_idx = -1
for i, line in enumerate(lines):
    if "{/* Bottom Scrollable Navigation Toolbar */}" in line:
        start_idx = i
        break

# The stray )\} from the active menu was left somewhere around start_idx-2
# Let's fix lines[start_idx-5 : start_idx]
# We want it to be:
#             </div>
#           </div>
#         </div>
#       )}

if ")}\n" in lines[start_idx-2] and "</div>\n" in lines[start_idx-3]:
    pass # ok

# For the end of the file, we want to close the Bottom Toolbar properly
for i in range(len(lines)-1, -1, -1):
    if "handleDownloadAndReupload" in lines[i]:
        # we will rewrite everything after this label
        new_lines = lines[:i+2]
        new_lines.append("          </div>\n")
        new_lines.append("      </div>\n")
        new_lines.append("      )}\n")
        new_lines.append("    </div>\n")
        new_lines.append("  );\n")
        new_lines.append("}\n")
        with open('src/components/AdminFlyers.tsx', 'w') as f:
            f.writelines(new_lines)
        break

# Let's remove any extra `)}` before the bottom toolbar
with open('src/components/AdminFlyers.tsx', 'r') as f:
    text = f.read()
    
# Wait, let's just make sure there's no double `)}`
import re
text = re.sub(r'\}\)\s*</div>\s*</div>\s*\}\)', '})', text)

