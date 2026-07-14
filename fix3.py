with open('src/components/AdminFlyers.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
for i, line in enumerate(lines):
    # Remove the errant )\}
    if "      )}\n" == line and "          </div>\n" == lines[i+1] and "        </div>\n" == lines[i+2]:
        continue
    new_lines.append(line)

# Let's fix the end of the file. It should end with
#           </div>
#       </div>
#       )}
#     </div>
#   );
# }

# We can just trim the last 6 lines and append the correct ones
while not new_lines[-1].strip() or new_lines[-1].strip() == "}":
    new_lines.pop()
    
if "});" in new_lines[-1] or ");" in new_lines[-1] or "</div>" in new_lines[-1]:
    pass # we'll just rewrite the last few lines safely

# Actually, let's just find where <label className="flex flex-col... Custom Bg ...
with open('src/components/AdminFlyers.tsx', 'w') as f:
    f.writelines(new_lines)
