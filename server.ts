import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// In-memory cache for fast lookups
let usersCache: any[] = [];
let isCacheLoaded = false;

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(USERS_FILE);
    } catch {
      await fs.writeFile(USERS_FILE, JSON.stringify([]));
    }
  } catch (err) {
    console.error("Error ensuring data directory:", err);
  }
}

async function getUsers() {
  if (isCacheLoaded) return usersCache;
  try {
    const data = await fs.readFile(USERS_FILE, 'utf-8');
    usersCache = JSON.parse(data);
    isCacheLoaded = true;
    return usersCache;
  } catch (error) {
    console.error("Error reading users file:", error);
    return [];
  }
}

async function saveUsers(users: any[]) {
  usersCache = users;
  isCacheLoaded = true;
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

async function startServer() {
  await ensureDataDir();
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // Request logging for debugging
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API Request] ${req.method} ${req.path}`);
    }
    next();
  });

  // Health check route
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || 'development'
    });
  });

  // Auth Router
  const authRouter = express.Router();

  authRouter.post("/register", async (req, res) => {
    const { email, password, name } = req.body;
    console.log(`[Auth] Register attempt for: ${email}`);
    try {
      const users = await getUsers();
      
      if (users.find((u: any) => u.email === email)) {
        console.warn(`[Auth] Register failed: User already exists (${email})`);
        return res.status(400).json({ error: "User already exists" });
      }

      const newUser = {
        id: Date.now().toString(),
        email,
        password, // In a real app, hash this!
        name,
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      await saveUsers(users);
      
      console.log(`[Auth] Register success for: ${email}`);
      const { password: _, ...userWithoutPassword } = newUser;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error(`[Auth] Register error:`, error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  authRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;
    console.log(`[Auth] Login attempt for: ${email}`);
    try {
      const users = await getUsers();
      const user = users.find((u: any) => u.email === email && u.password === password);
      
      if (!user) {
        console.warn(`[Auth] Login failed: Invalid credentials for ${email}`);
        return res.status(401).json({ error: "Invalid credentials" });
      }

      console.log(`[Auth] Login success for: ${email}`);
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error(`[Auth] Login error:`, error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.use("/api/auth", authRouter);

  // OpenRouter Models Route
  app.get("/api/models/openrouter", async (req, res) => {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/models", {
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY || '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'}`,
        }
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch models" });
    }
  });

  // API routes
  app.post("/api/video/generate", async (req, res) => {
    const { prompt, model, aspectRatio, startFrame, endFrame, withAudio } = req.body;
    const falKey = process.env.FAL_KEY;

    if (!falKey) {
      return res.status(500).json({ error: "FAL_KEY not configured in environment." });
    }

    try {
      const falModel = model;
      
      const body: any = {
        prompt,
        aspect_ratio: aspectRatio === '16:9' ? '16:9' : '9:16',
      };

      // Handle start/end frames based on model type
      if (falModel.includes('kling')) {
        if (startFrame) body.image_url = startFrame;
        if (endFrame) body.last_image_url = endFrame;
        if (withAudio !== undefined) body.with_audio = withAudio;
      } else if (falModel.includes('luma')) {
        if (startFrame) body.start_image_url = startFrame;
        if (endFrame) body.end_image_url = endFrame;
        if (withAudio !== undefined) body.with_audio = withAudio;
      } else if (falModel.includes('wan')) {
        if (startFrame) body.image_url = startFrame;
      }

      const response = await fetch(`https://queue.fal.run/${falModel}`, {
        method: "POST",
        headers: {
          "Authorization": `Key ${falKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Fal.ai API error: ${error}`);
      }

      const result = await response.json();
      const requestId = result.request_id;

      // Poll for completion
      let status = "IN_QUEUE";
      let videoUrl = null;

      while (status === "IN_QUEUE" || status === "IN_PROGRESS") {
        await new Promise(resolve => setTimeout(resolve, 5000));
        const statusResponse = await fetch(`https://queue.fal.run/${falModel}/requests/${requestId}`, {
          headers: {
            "Authorization": `Key ${falKey}`,
          },
        });
        const statusResult = await statusResponse.json();
        status = statusResult.status;
        if (status === "COMPLETED") {
          videoUrl = statusResult.video?.url;
        } else if (status === "FAILED") {
          throw new Error("Fal.ai video generation failed.");
        }
      }

      if (!videoUrl) throw new Error("Video URL not found in Fal.ai response.");

      res.json({ videoUrl });
    } catch (error: any) {
      console.error("Fal.ai generation error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // API 404 Handler - Catch any unmatched /api routes
  app.use("/api", (req, res) => {
    console.warn(`[API 404] ${req.method} ${req.path}`);
    res.status(404).json({ 
      error: "API Route Not Found", 
      method: req.method,
      path: req.path 
    });
  });

  // Global JSON Error Handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("[Server Error]", err);
    res.status(500).json({ 
      error: "Internal Server Error", 
      message: process.env.NODE_ENV === 'production' ? "Something went wrong" : err.message 
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false,
        watch: null,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
