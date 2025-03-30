import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

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

(async () => {
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
