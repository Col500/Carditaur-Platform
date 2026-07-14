const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const newEndpoints = `
  // Admin: Get all flyers
  app.get('/api/admin/flyers', async (req, res) => {
    try {
      const dataDir = path.join(process.cwd(), 'data');
      const files = await fs.readdir(dataDir);
      const flyerFiles = files.filter(f => f.startsWith('flyers_') && f.endsWith('.json'));
      let allFlyers = [];
      for (const file of flyerFiles) {
        const content = await fs.readFile(path.join(dataDir, file), 'utf8');
        const flyers = JSON.parse(content);
        const businessId = file.replace('flyers_', '').replace('.json', '');
        flyers.forEach(f => f.businessId = businessId);
        allFlyers.push(...flyers);
      }
      // sort by date descending
      allFlyers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      res.json({ success: true, flyers: allFlyers });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // Admin: Update flyer
  app.put('/api/admin/flyers/:businessId/:flyerId', async (req, res) => {
    try {
      const { businessId, flyerId } = req.params;
      const updates = req.body; // { status, headline, bodyMessage, etc. }
      
      const filePath = path.join(process.cwd(), 'data', \`flyers_\${businessId}.json\`);
      const content = await fs.readFile(filePath, 'utf8');
      const flyers = JSON.parse(content);
      
      const idx = flyers.findIndex(f => f.id === flyerId);
      if (idx !== -1) {
        flyers[idx] = { ...flyers[idx], ...updates };
        await fs.writeFile(filePath, JSON.stringify(flyers, null, 2));
        res.json({ success: true, flyer: flyers[idx] });
      } else {
        res.status(404).json({ error: 'Flyer not found' });
      }
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // Admin: Upload custom image for flyer
  app.post('/api/admin/flyers/:businessId/:flyerId/image', async (req, res) => {
    try {
      const { businessId, flyerId } = req.params;
      const { imageBase64 } = req.body;
      
      if (!imageBase64) return res.status(400).json({ error: 'Missing image data' });

      const filePath = path.join(process.cwd(), 'data', \`flyers_\${businessId}.json\`);
      const content = await fs.readFile(filePath, 'utf8');
      const flyers = JSON.parse(content);
      
      const idx = flyers.findIndex(f => f.id === flyerId);
      if (idx !== -1) {
         const base64Data = imageBase64.split(',')[1];
         const buffer = Buffer.from(base64Data, 'base64');
         const filename = \`\${businessId}_\${Date.now()}_custom.png\`;
         const flyersDir = path.resolve(process.cwd(), 'public', 'flyers');
         await fs.writeFile(path.join(flyersDir, filename), buffer);
         
         flyers[idx].imageUrl = \`/flyers/\${filename}\`;
         await fs.writeFile(filePath, JSON.stringify(flyers, null, 2));
         res.json({ success: true, imageUrl: flyers[idx].imageUrl });
      } else {
        res.status(404).json({ error: 'Flyer not found' });
      }
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
`;

code = code.replace(/(\/\/ Human feedback endpoint for RLHF calibration)/, newEndpoints + "\n  $1");
fs.writeFileSync('server.ts', code);
console.log("Admin endpoints added");
