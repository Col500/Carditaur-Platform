import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { createServer as createViteServer } from 'vite';
import { generateFlyersBatch, generatePromptPreview } from './src/pipeline.js';
import { GoogleGenAI } from '@google/genai';

interface BusinessRecord {
  id: string;
  businessName: string;
  industry: string;
  location: string;
  logoUrl?: string;
  brandColor: string;
  accentColor: string;
  extractedColors?: string[];
  subscribedOccasions: string[];
  countries: string[];
  createdAt: string;
  pendingDeletionDate?: string | null;
  profileType?: 'business' | 'individual';
  customEvents?: { id: string; name: string; date: string; type: 'birthday' | 'anniversary' | 'other'; notes?: string; isAnnual?: boolean }[];
  phone?: string;
  email?: string;
  instagram?: string; xUsername?: string;
  description?: string;
  businessType?: 'B2B' | 'B2C' | 'Both';
  brandTone?: 'corporate' | 'friendly' | 'playful' | 'premium';
  useSignOff?: boolean;
  signOffName?: string;
  signOffRole?: string;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Ensure JSON parsing works with support for larger base64 payloads (e.g. uploaded images or logos)
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Ensure static flyer paths exist immediately
  const flyersDir = path.resolve(process.cwd(), 'public', 'flyers');
  try {
    await fs.mkdir(flyersDir, { recursive: true });
  } catch (e) {
    // Already exists or can't write, handle gracefully
  }

  // Mount API paths first to avoid interceptions
  
  // 1. Get available occasions
  app.get('/api/occasions', async (req, res) => {
    try {
      const filePath = path.resolve(process.cwd(), 'data', 'occasions.json');
      const fileContent = await fs.readFile(filePath, 'utf8');
      res.json(JSON.parse(fileContent));
    } catch (e) {
      res.status(500).json({ error: 'Failed to retrieve occasions dataset.' });
    }
  });

  // 2. AI Recommended Occasions
  app.post('/api/ai-recommend-events', async (req, res) => {
    try {
      const { countries, maxEvents } = req.body;
      const filePath = path.resolve(process.cwd(), 'data', 'occasions.json');
      const fileContent = await fs.readFile(filePath, 'utf8');
      const allOccasions = JSON.parse(fileContent);

      const targetCountries = (countries || []).map((c: string) => c.toLowerCase());
      
      // Filter out custom ones
      const validOccasions = allOccasions.filter((o: any) => o.category !== 'custom');
      
      // 1. Get international events
      const international = validOccasions.filter((o: any) => o.countries.some((c: string) => c.toLowerCase() === 'international'));
      
      // 2. Get local events for countries
      const local = validOccasions.filter((o: any) => o.countries.some((c: string) => targetCountries.includes(c.toLowerCase())));

      // Combine and pick top (maxEvents + 5)
      const combined = Array.from(new Set([...local, ...international]));
      
      // We prioritize specific well-known events like christmas, new year, etc.
      const priority = combined.sort((a: any, b: any) => {
         const aIsGlobal = a.countries.includes("International");
         const bIsGlobal = b.countries.includes("International");
         if (aIsGlobal && !bIsGlobal) return -1;
         if (!aIsGlobal && bIsGlobal) return 1;
         return 0;
      });

      const selectedIds = priority.slice(0, (maxEvents || 18) + 5).map((o: any) => o.id);
      
      res.json({ recommendedIds: selectedIds });

    } catch (e: any) {
      console.error('AI Recommendation warning (falling back to default heuristic):', e.message);
      const filePath = path.resolve(process.cwd(), 'data', 'occasions.json');
      try {
        const fileContent = await fs.readFile(filePath, 'utf8');
        const allOccasions = JSON.parse(fileContent);
        const maxEventsFallback = req.body.maxEvents || 18;
        const selectedIds = allOccasions.slice(0, maxEventsFallback).map((o: any) => o.id);
        res.json({ recommendedIds: selectedIds });
      } catch (err) {
        res.status(500).json({ error: 'Failed to generate recommendations and fallback failed' });
      }
    }
  });

  // 3. Business Subscriber Signup (Step 6)
  app.post('/api/signup', async (req, res) => {
    try {
      const { businessName, industry, location, logoUrl, brandColor, accentColor, extractedColors, subscribedOccasions, countries, profileType, customEvents, phone, email, instagram, xUsername, description, businessType, brandTone, signOffName, signOffRole, useSignOff } = req.body;
      
      if (!businessName || !industry || !location) {
         return res.status(400).json({ error: 'Business name, industry, and location are required.' });
      }

      const id = 'biz_' + Math.random().toString(36).substr(2, 9);
      const businessPath = path.resolve(process.cwd(), 'data', 'businesses.json');
      
      let list: BusinessRecord[] = [];
      try {
        const fileContent = await fs.readFile(businessPath, 'utf8');
        list = JSON.parse(fileContent);
      } catch (err) {
        list = [];
      }

      // Enforce limits: maximum 2 business profiles and 1 personal profile
      const requestedType = profileType || 'business';
      const bizCount = list.filter(b => b.profileType === 'business' || !b.profileType).length;
      const personalCount = list.filter(b => b.profileType === 'individual').length;

      if (requestedType === 'business' && bizCount >= 2) {
        return res.status(400).json({ error: 'You have reached the maximum allowance of two active Business profiles. Please delete a profile first.' });
      }
      if (requestedType === 'individual' && personalCount >= 1) {
        return res.status(400).json({ error: 'You have reached the maximum allowance of one active Personal Individual profile. Please delete your existing personal profile first.' });
      }

      const newRecord: BusinessRecord = {
        id,
        businessName,
        industry,
        location,
        logoUrl: logoUrl || '',
        brandColor: brandColor || '#008751',
        accentColor: accentColor || '#FFFFFF',
        extractedColors: extractedColors || [],
        subscribedOccasions: Array.from(new Set([...(subscribedOccasions || []), "christmas", "new_years_day", "easter_sunday", "valentines_day", "democracy_day", "nigeria_independence_day"])),
        countries: countries && countries.length > 0 ? countries : ["Nigeria"],
        createdAt: new Date().toISOString(),
        profileType: profileType || 'business',
        customEvents: customEvents || [],
        phone: phone || '',
        email: email || '',
        instagram: instagram || '', xUsername: xUsername || '',
        description: description || '',
        businessType: businessType || 'Both',
        brandTone: brandTone || 'corporate',
        signOffName: signOffName || '',
        signOffRole: signOffRole || '',
        useSignOff: useSignOff || false
      };

      list.push(newRecord);
      await fs.writeFile(businessPath, JSON.stringify(list, null, 2), 'utf8');
      
      console.log(`Successfully registered business model: ${businessName} [${id}]`);
      res.json(newRecord);
    } catch (e: any) {
      res.status(500).json({ error: `Subscriber database error: ${e.message}` });
    }
  });

  // 3. Get lists of small businesses registered
  app.get('/api/businesses', async (req, res) => {
    try {
      const businessPath = path.resolve(process.cwd(), 'data', 'businesses.json');
      const fileContent = await fs.readFile(businessPath, 'utf8');
      const list: BusinessRecord[] = JSON.parse(fileContent);
      
      const now = new Date();
      // Auto-purge records whose pending deletion date is in the past
      const activeRecords = list.filter(b => {
        if (b.pendingDeletionDate) {
          const deletionTime = new Date(b.pendingDeletionDate);
          if (deletionTime <= now) {
            console.log(`Auto-purged expired business record: ${b.businessName} (${b.id})`);
            return false;
          }
        }
        return true;
      });

      // Clear expired one-off custom events
      const yy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const todayStr = `${yy}-${mm}-${dd}`; // current date "2026-06-17"

      let hasEventChange = false;
      const cleanedRecords = activeRecords.map(b => {
        if (b.customEvents && b.customEvents.length > 0) {
          const filteredEvents = b.customEvents.filter(evt => {
            if (evt.isAnnual === false) {
              // It's a one-off event. Let's check if the date has reached or passed.
              let evtDateStr = evt.date;
              if (evt.date.length === 5) { // MM-DD
                evtDateStr = `${yy}-${evt.date}`;
              }
              // If event date <= today, it has reached or passed, so delete it!
              if (evtDateStr <= todayStr) {
                console.log(`Pruned reached/passed one-off event: ${evt.name} (${evt.date})`);
                hasEventChange = true;
                return false;
              }
            }
            return true;
          });
          if (filteredEvents.length !== b.customEvents.length) {
            return {
              ...b,
              customEvents: filteredEvents
            };
          }
        }
        return b;
      });

      if (cleanedRecords.length !== list.length || hasEventChange) {
        await fs.writeFile(businessPath, JSON.stringify(cleanedRecords, null, 2), 'utf8');
      }

      res.json(cleanedRecords);
    } catch (e) {
      res.json([]);
    }
  });

  // 4. Retrieve single business
  app.get('/api/businesses/:id', async (req, res) => {
    try {
      const businessPath = path.resolve(process.cwd(), 'data', 'businesses.json');
      const fileContent = await fs.readFile(businessPath, 'utf8');
      const list: BusinessRecord[] = JSON.parse(fileContent);
      const biz = list.find(b => b.id === req.params.id);
      if (biz) {
        res.json(biz);
      } else {
        res.status(404).json({ error: 'Business subscription not found.' });
      }
    } catch (e) {
      res.status(500).json({ error: 'Database loading failure.' });
    }
  });

  // 4b. Update / Edit single business
  app.put('/api/businesses/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const businessPath = path.resolve(process.cwd(), 'data', 'businesses.json');
      
      let list: BusinessRecord[] = [];
      try {
        const fileContent = await fs.readFile(businessPath, 'utf8');
        list = JSON.parse(fileContent);
      } catch (err) {
        list = [];
      }
      
      const index = list.findIndex(b => b.id === id);
      if (index !== -1) {
        const existing = list[index];
        list[index] = {
          ...existing,
          ...req.body,
          subscribedOccasions: Array.from(new Set([...(req.body.subscribedOccasions || existing.subscribedOccasions || []), "christmas", "new_years_day", "easter_sunday", "valentines_day", "democracy_day", "nigeria_independence_day"])),
          id: existing.id, // Immutable
          createdAt: existing.createdAt // Immutable
        };
        await fs.writeFile(businessPath, JSON.stringify(list, null, 2), 'utf8');
        console.log(`Successfully updated business profile: ${id}`);
        res.json(list[index]);
      } else {
        res.status(404).json({ error: 'Business profile not found.' });
      }
    } catch (e: any) {
      res.status(500).json({ error: `Subscriber database error: ${e.message}` });
    }
  });

  // DELETE business endpoint to support deleting registered businesses (Request Requirement)
  app.delete('/api/businesses/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const businessPath = path.resolve(process.cwd(), 'data', 'businesses.json');
      
      let list: BusinessRecord[] = [];
      try {
        const fileContent = await fs.readFile(businessPath, 'utf8');
        list = JSON.parse(fileContent);
      } catch (err) {
        list = [];
      }
      
      const filtered = list.filter(b => b.id !== id);
      await fs.writeFile(businessPath, JSON.stringify(filtered, null, 2), 'utf8');
      
      console.log(`Successfully deleted business profile: ${id}`);
      res.json({ success: true, deletedId: id });
    } catch (e: any) {
      res.status(500).json({ error: `Subscriber database error: ${e.message}` });
    }
  });

  // Preview prompt generation
  app.post('/api/preview-prompt', async (req, res) => {
    try {
      const { businessId, occasionId, overrideOccasionName } = req.body;
      
      if (!businessId || !occasionId) {
        return res.status(400).json({ error: 'businessId and occasionId are required inputs.' });
      }

      const activeOccasionId = overrideOccasionName || occasionId;
      const promptData = await generatePromptPreview(businessId, occasionId, overrideOccasionName);
      res.json(promptData);
    } catch (e: any) {
      console.error("Preview Prompt Error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  // 5. Build/Pipeline orchestration endpoint (Step 7)
  app.post('/api/generate-flyers-batch', async (req, res) => {
    try {
      const { businessId, occasionId, overrideOccasionName } = req.body;
      
      if (!businessId || !occasionId) {
        return res.status(400).json({ error: 'businessId and occasionId are required inputs.' });
      }

      const activeOccasionId = overrideOccasionName || occasionId;

      // New pipeline generates 2 at once using Ideogram API
      const result = await generateFlyersBatch(businessId, occasionId, overrideOccasionName, 2);
      
      res.json({
        success: true,
        flyers: result.flyers
      });
    } catch (e: any) {
      console.error('API Pipeline Orchestrator crashed:', e);
      res.status(500).json({ error: `Pipeline orchestration crashed: ${e.message}` });
    }
  });

  // Backward compatibility endpoint
  app.post('/api/generate-flyer', async (req, res) => {
    try {
      const { businessId, occasionId, overrideOccasionName } = req.body;
      
      if (!businessId || !occasionId) {
        return res.status(400).json({ error: 'businessId and occasionId are required inputs.' });
      }

      const activeOccasionId = overrideOccasionName || occasionId;
      const result = await generateFlyersBatch(businessId, occasionId, overrideOccasionName, 1);
      
      if (!result.flyers || result.flyers.length === 0) {
          throw new Error('No flyers were generated');
      }

      const flyer = result.flyers[0];

      res.json({
        success: true,
        imageUrl: flyer.imageUrl,
        isHTMLFallback: false,
        flyerData: flyer
      });
    } catch (e: any) {
      console.error('API Pipeline Orchestrator crashed:', e);
      res.status(500).json({ error: `Pipeline orchestration crashed: ${e.message}` });
    }
  });

  
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
      
      const filePath = path.join(process.cwd(), 'data', `flyers_${businessId}.json`);
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

  // Admin: Upload custom image for flyer
  app.post('/api/admin/flyers/:businessId/:flyerId/image', async (req, res) => {
    try {
      const { businessId, flyerId } = req.params;
      const { imageBase64 } = req.body;
      
      if (!imageBase64) return res.status(400).json({ error: 'Missing image data' });

      const filePath = path.join(process.cwd(), 'data', `flyers_${businessId}.json`);
      const content = await fs.readFile(filePath, 'utf8');
      const flyers = JSON.parse(content);
      
      const idx = flyers.findIndex(f => f.id === flyerId);
      if (idx !== -1) {
         const base64Data = imageBase64.split(',')[1];
         const buffer = Buffer.from(base64Data, 'base64');
         const filename = `${businessId}_${Date.now()}_custom.png`;
         const flyersDir = path.resolve(process.cwd(), 'public', 'flyers');
         await fs.writeFile(path.join(flyersDir, filename), buffer);
         
         flyers[idx].imageUrl = `/flyers/${filename}`;
         await fs.writeFile(filePath, JSON.stringify(flyers, null, 2));
         res.json({ success: true, imageUrl: flyers[idx].imageUrl });
      } else {
        res.status(404).json({ error: 'Flyer not found' });
      }
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // Human feedback endpoint for RLHF calibration
  app.get('/api/admin/templates', (req, res) => {
     res.json([]);
  });

  app.get('/api/admin/config', async (req, res) => {
      try {
          const configPath = path.join(process.cwd(), 'data', 'config.json');
          const data = await fs.readFile(configPath, 'utf8');
          res.json(JSON.parse(data));
      } catch (err) {
          res.json({ ideogramApiKey: '' });
      }
  });

  app.post('/api/admin/config', async (req, res) => {
      try {
          const configPath = path.join(process.cwd(), 'data', 'config.json');
          await fs.writeFile(configPath, JSON.stringify(req.body, null, 2));
          res.json({ success: true });
      } catch (err) {
          res.status(500).json({ error: 'Failed to save config' });
      }
  });

  // Fetch generated flyers for a business profile
  app.get('/api/business/:businessId/flyers', async (req, res) => {
     try {
        const { businessId } = req.params;
        const filePath = path.join(process.cwd(), 'data', `flyers_${businessId}.json`);
        let data = [];
        try {
           const content = await fs.readFile(filePath, 'utf8');
           data = JSON.parse(content).filter((f) => f.status === 'approved');
        } catch (err) {
           data = []; // none generated yet
        }
        res.json({ success: true, flyers: data });
     } catch (e: any) {
        res.status(500).json({ error: e.message });
     }
  });

  // Static serving for generated flyer previews
  app.use('/flyers', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  }, express.static(path.join(process.cwd(), 'public', 'flyers')));

  // Enable /signup.html or other static files in /public to serve natively on port 3000
  app.use(express.static(path.join(process.cwd(), 'public')));

  // Vite middleware handling of assets
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Carditaur full-stack container actively listening on http://localhost:${PORT}`);
  });
}

startServer();
