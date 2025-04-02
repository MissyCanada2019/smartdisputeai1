import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedDatabase } from "./seed";
import { MemStorage } from "./storage";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enable CORS for public access
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Simple request logging middleware
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    const start = Date.now();
    res.on("finish", () => {
      log(`${req.method} ${req.path} ${res.statusCode} in ${Date.now() - start}ms`);
    });
  }
  next();
});

// Serve Google verification files directly from the root directory
app.use(express.static(path.join(__dirname, '..'), {
  index: false,
  // Only allow specific files to be served from the root
  setHeaders: (res, filePath) => {
    const filename = path.basename(filePath);
    if (filename === 'google4b945706e36a5db4.html' || 
        filename === 'google9fGsDdnUDR_1_WC3hApOV0nkhDs7MQL9ZVA1s5UC5nU.html') {
      res.setHeader('Content-Type', 'text/html');
    }
  }
}));

(async () => {
  // Create storage instance
  const storage = new MemStorage();
  
  // Seed the database with initial data
  try {
    await seedDatabase(storage);
    log("Database seeded successfully");
  } catch (error) {
    log("Error seeding database:", error);
  }
  
  const server = await registerRoutes(app);
  
  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
    throw err;
  });

  // Setup Vite or static serving
  app.get("env") === "development" ? await setupVite(app, server) : serveStatic(app);

  return server.listen(5000, "0.0.0.0", () => log("serving on port 5000"));
})();
