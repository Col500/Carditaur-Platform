with open('src/components/AdminFlyers.tsx', 'r') as f:
    lines = f.readlines()

# Search backwards for the last `</div>` block and insert `)}`
for i in range(len(lines)-1, -1, -1):
    if "</div>" in lines[i] and "</div>" in lines[i-1] and "</div>" in lines[i-2]:
        lines.insert(i-1, "      )}\n")
        break

with open('src/components/AdminFlyers.tsx', 'w') as f:
    f.writelines(lines)
