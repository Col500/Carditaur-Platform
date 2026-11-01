import re

with open('server.ts', 'r') as f:
    text = f.read()

target = r"const vite = await createViteServer\(\{[\s\S]*?app\.use\(vite\.middlewares\);"
replacement = """app.use(express.static(path.join(process.cwd(), 'public')));
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);"""

text = re.sub(target, replacement, text)

with open('server.ts', 'w') as f:
    f.write(text)
print("Fixed server.ts")
