import re

with open('server.ts', 'r') as f:
    text = f.read()

upload_api = """
  // Admin: Upload a completely new flyer
  app.post('/api/admin/flyers/upload', async (req, res) => {
    try {
      const { imageBase64, businessId, occasionName } = req.body;
      if (!imageBase64 || !businessId) return res.status(400).json({ error: 'Missing data' });
      
      const filePath = path.join(process.cwd(), 'data', `flyers_${businessId}.json`);
      let flyers = [];
      try {
          const content = await fs.readFile(filePath, 'utf8');
          flyers = JSON.parse(content);
      } catch (e) { flyers = []; }
      
      const base64Data = imageBase64.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      const flyerId = "flyer_" + Date.now();
      const filename = `${businessId}_${flyerId}_custom.png`;
      const flyersDir = path.resolve(process.cwd(), 'public', 'flyers');
      await fs.writeFile(path.join(flyersDir, filename), buffer);
      
      const newFlyer = {
          id: flyerId,
          imageUrl: `/flyers/${filename}`,
          status: "pending_review",
          headline: "",
          bodyMessage: "",
          signOff: "",
          contactInfo: "",
          typography: {},
          greetingMessage: "Custom uploaded flyer",
          occasionName: occasionName || "Custom",
          createdAt: new Date().toISOString(),
          flyerData: { width: 800, height: 1000 },
          debug: {},
          businessId: businessId
      };
      
      flyers.push(newFlyer);
      await fs.writeFile(filePath, JSON.stringify(flyers, null, 2));
      
      res.json({ success: true, flyer: newFlyer });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });
"""

text = text.replace("  // Admin: Upload custom image for flyer", upload_api + "\n  // Admin: Upload custom image for flyer")

with open('server.ts', 'w') as f:
    f.write(text)
print("Added upload API")
